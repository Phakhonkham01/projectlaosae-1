/**
 * One-off migration: reshape emulator Firestore data to the new structure.
 *
 *   Users            -> users            (copy, same ids)
 *   ships            -> ship             (copy, same ids)
 *   products         -> products         (normalize: image->imageUrl, defaults)
 *   bill + history_booking -> booking    (merge + dedupe, prefer `bill`)
 *   (per booking)    -> payment          (bookingId, userId, Amount, Date)
 *   deletes old: Users, ships, bill, history_booking
 *
 * SAFETY: only run against the EMULATOR with a FRESH import. Re-running after a
 * partial run can duplicate `booking`/`payment` docs (booking uses new ids).
 * Back up the export folder before running.
 *
 * Usage (emulator must be running with the export imported):
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8081 node migrate-collections.mjs
 */
import admin from 'firebase-admin'

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'languages-164bd'

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('Refusing to run: FIRESTORE_EMULATOR_HOST is not set (emulator-only script).')
  process.exit(1)
}

admin.initializeApp({projectId: PROJECT_ID})
const db = admin.firestore()

const readAll = async (name) => {
  const snap = await db.collection(name).get()
  return snap.docs.map((d) => ({id: d.id, data: d.data()}))
}

const deleteAll = async (name) => {
  const snap = await db.collection(name).get()
  let batch = db.batch()
  let n = 0
  for (const doc of snap.docs) {
    batch.delete(doc.ref)
    if (++n % 400 === 0) {
      await batch.commit()
      batch = db.batch()
    }
  }
  await batch.commit()
  return snap.size
}

// stable content key for deduping bill vs history_booking copies of one booking
const bookingKey = (d) =>
  [
    d.user_id || d.user_email || '',
    d.ship_id || d.ship_name || '',
    d.booking_date || '',
    d.booking_time || '',
    d.grand_total ?? '',
    d.createdAt || '',
  ].join('|')

async function main() {
  console.log(`Connected to emulator ${process.env.FIRESTORE_EMULATOR_HOST}, project ${PROJECT_ID}`)

  // 1. Users -> users (same ids)
  const users = await readAll('Users')
  for (const {id, data} of users) await db.collection('users').doc(id).set(data)
  console.log(`users: copied ${users.length}`)

  // 2. ships -> ship (same ids)
  const ships = await readAll('ships')
  for (const {id, data} of ships) await db.collection('ship').doc(id).set(data)
  console.log(`ship: copied ${ships.length}`)

  // 3. products -> products (normalize field names / defaults)
  const products = await readAll('products')
  for (const {id, data} of products) {
    const normalized = {
      ...data,
      name: data.name ?? '',
      price: data.price ?? 0,
      categoryId: data.categoryId ?? data.category_id ?? '',
      available: data.available ?? true,
      imageUrl: data.imageUrl ?? data.image ?? '',
    }
    delete normalized.image
    delete normalized.category_id
    await db.collection('products').doc(id).set(normalized)
  }
  console.log(`products: normalized ${products.length}`)

  // 4. bill + history_booking -> booking (merge, dedupe, prefer `bill`)
  const bills = await readAll('bill')
  const history = await readAll('history_booking')
  const byKey = new Map()
  // history first, then bill so the live `bill` copy wins on collision
  for (const {data} of history) byKey.set(bookingKey(data), data)
  for (const {data} of bills) byKey.set(bookingKey(data), data)

  const bookingRefs = []
  for (const data of byKey.values()) {
    const ref = db.collection('booking').doc() // new id
    await ref.set(data)
    bookingRefs.push({id: ref.id, data})
  }
  console.log(`booking: merged ${bills.length} bill + ${history.length} history -> ${bookingRefs.length} unique`)

  // 5. payment: one doc per booking
  for (const {id, data} of bookingRefs) {
    await db.collection('payment').add({
      bookingId: id,
      userId: data.user_id ?? '',
      Amount: data.grand_total ?? 0,
      Date: data.createdAt ?? '',
    })
  }
  console.log(`payment: created ${bookingRefs.length}`)

  // 6. delete old collections
  for (const old of ['Users', 'ships', 'bill', 'history_booking']) {
    const removed = await deleteAll(old)
    console.log(`deleted old collection ${old} (${removed} docs)`)
  }

  console.log('Migration complete.')
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
