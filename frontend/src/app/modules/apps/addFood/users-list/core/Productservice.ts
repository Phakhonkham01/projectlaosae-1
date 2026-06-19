// ─── Types ────────────────────────────────────────────────────────────────────
export interface Product {
  product_id: string;    // alias ຂອງ doc id
  name: string;          // ຊື່
  price: number;         // ລາຄາ
  categoryId: string;    // ອ້າງອີງໄປຫາ collection categories (FK)
  available: boolean;    // ສະຖານະຄວາມພ້ອມໃຊ້ງານ
  imageUrl: string;      // ຮູບສິນຄ້າ
}

export type ProductCreate = Omit<Product, "product_id">;
export type ProductUpdate = Partial<ProductCreate>;

// ─── Imports ──────────────────────────────────────────────────────────────────
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../../../../../../firebase/useFirebase"; // adjust path as needed

const COLLECTION = "products";
const colRef = () => collection(db, COLLECTION);

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export const getAllProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(colRef());
  return snapshot.docs.map((d) => ({ product_id: d.id, ...d.data() } as Product));
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
export const getProductById = async (id: string): Promise<Product | null> => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { product_id: snap.id, ...snap.data() } as Product;
};

// ─── GET BY CATEGORY ID ───────────────────────────────────────────────────────
/**
 * ດຶງສິນຄ້າຕາມ category_id (reference ໄປ collection categories)
 */
export const getProductsByCategoryId = async (categoryId: string): Promise<Product[]> => {
  const constraints: QueryConstraint[] = [
    where("categoryId", "==", categoryId),
    orderBy("name"),
  ];
  const snapshot = await getDocs(query(colRef(), ...constraints));
  return snapshot.docs.map((d) => ({ product_id: d.id, ...d.data() } as Product));
};

// ─── GET AVAILABLE ────────────────────────────────────────────────────────────
export const getAvailableProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(
    query(colRef(), where("available", "==", true))
  );
  return snapshot.docs.map((d) => ({ product_id: d.id, ...d.data() } as Product));
};

// ─── GET AVAILABLE BY CATEGORY ────────────────────────────────────────────────
export const getAvailableProductsByCategoryId = async (
  categoryId: string
): Promise<Product[]> => {
  const snapshot = await getDocs(
    query(
      colRef(),
      where("categoryId", "==", categoryId),
      where("available", "==", true),
      orderBy("name")
    )
  );
  return snapshot.docs.map((d) => ({ product_id: d.id, ...d.data() } as Product));
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createProduct = async (data: ProductCreate): Promise<Product> => {
  const docRef = await addDoc(colRef(), data);
  return { product_id: docRef.id, ...data };
};

export const createProductWithId = async (
  id: string,
  data: ProductCreate
): Promise<Product> => {
  await setDoc(doc(db, COLLECTION, id), data);
  return { product_id: id, ...data };
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateProduct = async (
  id: string,
  data: ProductUpdate
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), data as Record<string, unknown>);
};

export const toggleAvailability = async (
  id: string,
  available: boolean
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), { available });
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};