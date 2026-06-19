import { FC, useEffect, useState, useRef } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import clsx from 'clsx'
import { isNotEmpty } from '../../../../../../_metronic/helpers'
import { initialUser, User } from '../core/_models'
import { useListView } from '../core/ListViewProvider'
import { UsersListLoading } from '../components/loading/UsersListLoading'
import { createUser, updateUser } from '../core/_requests'
import { useQueryResponse } from '../core/QueryResponseProvider'
import { QUERIES } from '../../../../../../_metronic/helpers/crud-helper/consts'
import { useMutation, useQueryClient, QueryKey } from 'react-query'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../../../../../../../../firebase/useFirebase' // ✅ ปรับ path

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
  category_id: string
  name: string
}

type Props = {
  isUserLoading: boolean
  user?: User
}

// ─── Validation ───────────────────────────────────────────────────────────────
const productSchema = Yup.object().shape({
  name: Yup.string().required('ກະລຸນາໃສ່ຊື່ສິນຄ້າ'),
  price: Yup.number().moreThan(0, 'ລາຄາຕ້ອງຫຼາຍກວ່າ 0').required('ກະລຸນາໃສ່ລາຄາ'),
  categoryId: Yup.string().required('ກະລຸນາເລືອກໝວດໝູ່'),
  imageUrl: Yup.string().required('ກະລຸນາໃສ່ຮູບສິນຄ້າ'),
  available: Yup.boolean().required(),
})

// ─── Component ────────────────────────────────────────────────────────────────
const UserEditModalForm: FC<Props> = ({ user, isUserLoading }) => {
  const { setItemIdForUpdate } = useListView()
  const { query } = useQueryResponse()
  const queryClient = useQueryClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false)

  // ── Image upload state ─────────────────────────────────────────────────────
  const [imagePreview, setImagePreview] = useState<string>(user?.imageUrl || '')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Fetch categories ───────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const snapshot = await getDocs(collection(db, 'categories'))
      setCategories(
        snapshot.docs.map((d) => ({
          category_id: d.id,
          name: (d.data() as { name: string }).name,
        }))
      )
    } catch (err) {
      console.error('Error fetching categories:', err)
      toast.error('ບໍ່ສາມາດໂຫຼດໝວດໝູ່ໄດ້')
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // ── Image upload handler ───────────────────────────────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type & size
    if (!file.type.startsWith('image/')) {
      toast.error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ຮູບຕ້ອງນ້ອຍກວ່າ 5MB')
      return
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setImagePreview(localUrl)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload to Firebase Storage: products/{timestamp}_{filename}
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          )
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          toast.error('ອັບໂຫຼດຮູບບໍ່ສຳເລັດ')
          setUploading(false)
          setImagePreview(formik.values.imageUrl || '')
        },
        async () => {
          // ✅ Upload complete — get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          formik.setFieldValue('imageUrl', downloadURL)
          setImagePreview(downloadURL)
          setUploading(false)
          setUploadProgress(0)
          toast.success('ອັບໂຫຼດຮູບສຳເລັດແລ້ວ!')
        }
      )
    } catch (err) {
      toast.error('ອັບໂຫຼດບໍ່ສຳເລັດ')
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    // ลบจาก Storage ถ้าเป็น Firebase URL
    if (formik.values.imageUrl?.includes('firebasestorage')) {
      try {
        const imageRef = ref(storage, formik.values.imageUrl)
        await deleteObject(imageRef)
      } catch {
        // ไม่สำคัญถ้าลบ storage ไม่สำเร็จ
      }
    }
    formik.setFieldValue('imageUrl', '')
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Formik ─────────────────────────────────────────────────────────────────
  const formik = useFormik<User>({
    initialValues: {
      ...initialUser,
      ...user,
      name: user?.name || '',
      price: user?.price || 0,
      categoryId: user?.categoryId || '',
      imageUrl: user?.imageUrl || '',
      available: user?.available ?? true,
    },
    validationSchema: productSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isNotEmpty(values.product_id)) {
          await updateMutation.mutateAsync(values)
        } else {
          await createMutation.mutateAsync(values)
        }
        setItemIdForUpdate(undefined)
      } catch (err) {
        console.error('Submit error:', err)
      } finally {
        setSubmitting(false)
      }
    },
  })

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`] as QueryKey)

  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: '<span style="color:#10b981;font-weight:bold;">ສ້າງສິນຄ້າສຳເລັດ</span>',
        text: 'ສິນຄ້າໄດ້ຖືກສ້າງຂຶ້ນສຳເລັດແລ້ວ.',
        timer: 2000,
        showConfirmButton: false,
      }).then(invalidate)
    },
    onError: (err: any) => {
      Swal.fire({ icon: 'error', title: 'ຜິດພາດ', text: err?.message || 'ມີບາງຢ່າງຜິດພາດ!' })
    },
  })

  const updateMutation = useMutation(updateUser, {
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: '<span style="color:#10b981;">ອັບເດດສິນຄ້າສຳເລັດ</span>',
        text: 'ສິນຄ້າໄດ້ຖືກອັບເດດສຳເລັດແລ້ວ.',
        confirmButtonText: 'ຕົກລົງ',
      }).then(invalidate)
    },
    onError: (err: any) => {
      Swal.fire({ icon: 'error', title: 'ຜິດພາດ', text: err?.message || 'ອັບເດດສິນຄ້າບໍ່ສຳເລັດ' })
    },
  })

  // ── Category handlers ──────────────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setSavingCategory(true)
    try {
      const docRef = await addDoc(collection(db, 'categories'), { name: newCategoryName.trim() })
      const created: Category = { category_id: docRef.id, name: newCategoryName.trim() }
      setCategories((prev) => [...prev, created])
      formik.setFieldValue('categoryId', docRef.id)
      setNewCategoryName('')
      setShowCategoryModal(false)
      toast.success('ສ້າງໝວດໝູ່ສຳເລັດ!')
    } catch {
      toast.error('ສ້າງໝວດໝູ່ບໍ່ສຳເລັດ')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return
    setSavingCategory(true)
    try {
      await updateDoc(doc(db, 'categories', editingCategory.category_id), {
        name: newCategoryName.trim(),
      })
      setCategories((prev) =>
        prev.map((c) =>
          c.category_id === editingCategory.category_id
            ? { ...c, name: newCategoryName.trim() }
            : c
        )
      )
      setEditingCategory(null)
      setNewCategoryName('')
      toast.success('ອັບເດດໝວດໝູ່ສຳເລັດ!')
    } catch {
      toast.error('ອັບເດດໝວດໝູ່ບໍ່ສຳເລັດ')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ລຶບໝວດໝູ່?',
      text: `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${cat.name}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'ແມ່ນແລ້ວ, ລຶບ',
    })
    if (!result.isConfirmed) return
    try {
      await deleteDoc(doc(db, 'categories', cat.category_id))
      setCategories((prev) => prev.filter((c) => c.category_id !== cat.category_id))
      if (formik.values.categoryId === cat.category_id) formik.setFieldValue('categoryId', '')
      toast.success('ລຶບໝວດໝູ່ສຳເລັດ!')
    } catch {
      toast.error('ລຶບໝວດໝູ່ບໍ່ສຳເລັດ')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isSubmitting = formik.isSubmitting || createMutation.isLoading || updateMutation.isLoading
  const isEditMode = isNotEmpty(formik.values.product_id)

  const fieldClass = (name: keyof User) =>
    clsx('form-control form-control-solid', {
      'is-invalid': formik.touched[name] && formik.errors[name],
    })

  const cancel = () => setItemIdForUpdate(undefined)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <form className='form' onSubmit={formik.handleSubmit} noValidate>

        {/* Product Name */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-2'>ຊື່ສິນຄ້າ</label>
          <input
            type='text'
            {...formik.getFieldProps('name')}
            className={fieldClass('name')}
            placeholder='ຕົວຢ່າງ: ເຂົ້າໜຽວ'
            disabled={isSubmitting || isUserLoading}
          />
          {formik.touched.name && formik.errors.name && (
            <div className='fv-plugins-message-container'>
              <span role='alert' className='fv-help-block'>{formik.errors.name as string}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-2'>ລາຄາ</label>
          <div className='input-group'>
            <input
              type='number'
              min={0}
              {...formik.getFieldProps('price')}
              className={fieldClass('price')}
              disabled={isSubmitting || isUserLoading}
            />
            <span className='input-group-text'>LAK</span>
          </div>
          {formik.touched.price && formik.errors.price && (
            <div className='fv-plugins-message-container'>
              <span role='alert' className='fv-help-block'>{formik.errors.price as string}</span>
            </div>
          )}
        </div>

        {/* Category */}
        <div className='fv-row mb-7'>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <label className='required fw-bold fs-6'>ໝວດໝູ່</label>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-sm btn-light-info'
                onClick={() => setShowManageCategoriesModal(true)}
                disabled={isSubmitting || isUserLoading}
              >
                <i className='bi bi-gear me-1' />ຈັດການ
              </button>
              <button
                type='button'
                className='btn btn-sm btn-light-primary'
                onClick={() => { setNewCategoryName(''); setShowCategoryModal(true) }}
                disabled={isSubmitting || isUserLoading}
              >
                <i className='bi bi-plus-circle me-1' />ສ້າງໃໝ່
              </button>
            </div>
          </div>
          <select
            {...formik.getFieldProps('categoryId')}
            className={fieldClass('categoryId')}
            disabled={isSubmitting || isUserLoading || loadingCategories}
          >
            <option value=''>ເລືອກໝວດໝູ່</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
            ))}
          </select>
          {formik.touched.categoryId && formik.errors.categoryId && (
            <div className='fv-plugins-message-container'>
              <span role='alert' className='fv-help-block'>{formik.errors.categoryId as string}</span>
            </div>
          )}
        </div>

        {/* ── Image Upload ───────────────────────────────────────────────────── */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-2'>ຮູບສິນຄ້າ</label>

          {/* Preview box */}
          <div
            className='border rounded d-flex align-items-center justify-content-center bg-light mb-3'
            style={{ width: 200, height: 200, overflow: 'hidden', position: 'relative', margin: '0 auto' }}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt='preview'
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Remove button */}
                {!uploading && (
                  <button
                    type='button'
                    onClick={handleRemoveImage}
                    className='btn btn-icon btn-sm btn-danger'
                    style={{ position: 'absolute', top: 8, right: 8 }}
                    disabled={isSubmitting}
                  >
                    <i className='bi bi-x-lg fs-5' />
                  </button>
                )}
                {/* Upload progress overlay */}
                {uploading && (
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    <div className='spinner-border text-white' />
                    <span className='text-white fw-bold'>{uploadProgress}%</span>
                    <div className='w-75'>
                      <div className='progress' style={{ height: 6 }}>
                        <div
                          className='progress-bar bg-success'
                          style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className='text-center text-muted'>
                <i className='bi bi-image fs-2x d-block mb-2' />
                <span className='fs-7'>ຍັງບໍ່ໄດ້ເລືອກຮູບ</span>
              </div>
            )}
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='d-none'
            onChange={handleImageChange}
            disabled={uploading || isSubmitting}
          />
          <button
            type='button'
            className='btn btn-light-primary w-100'
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isSubmitting || isUserLoading}
          >
            {uploading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' />
                ກຳລັງອັບໂຫຼດ... {uploadProgress}%
              </>
            ) : (
              <>
                <i className='bi bi-upload me-2' />
                {imagePreview ? 'ປ່ຽນຮູບ' : 'ອັບໂຫຼດຮູບ'}
              </>
            )}
          </button>

          {formik.touched.imageUrl && formik.errors.imageUrl && (
            <div className='fv-plugins-message-container mt-2'>
              <span role='alert' className='fv-help-block'>{formik.errors.imageUrl as string}</span>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-3'>ສະຖານະການຈຳໜ່າຍ</label>
          <div className='d-flex gap-6'>
            {([true, false] as const).map((val) => (
              <div key={String(val)} className='form-check form-check-custom form-check-solid'>
                <input
                  id={`avail-${val}`}
                  className='form-check-input'
                  type='radio'
                  checked={formik.values.available === val}
                  onChange={() => formik.setFieldValue('available', val)}
                  disabled={isSubmitting || isUserLoading}
                />
                <label htmlFor={`avail-${val}`} className='form-check-label fw-bold text-gray-800'>
                  {val
                    ? <span className='badge badge-light-success'>ມີຈຳໜ່າຍ</span>
                    : <span className='badge badge-light-danger'>ໝົດ / ບໍ່ມີ</span>}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className='text-end pt-3'>
          <button
            type='button'
            className='btn btn-light me-3'
            onClick={cancel}
            disabled={isSubmitting || uploading}
          >
            ຍົກເລີກ
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={isSubmitting || isUserLoading || !formik.isValid || uploading}
          >
            {isSubmitting ? (
              <>ກຳລັງດຳເນີນການ... <span className='spinner-border spinner-border-sm align-middle ms-2' /></>
            ) : isEditMode ? 'ອັບເດດສິນຄ້າ' : 'ສ້າງສິນຄ້າ'}
          </button>
        </div>
      </form>

      {/* ── Create Category Modal ──────────────────────────────────────────── */}
      {showCategoryModal && (
        <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'><i className='bi bi-tag me-2' />ສ້າງໝວດໝູ່</h5>
                <button type='button' className='btn-close' onClick={() => setShowCategoryModal(false)} />
              </div>
              <div className='modal-body'>
                <label className='required fw-bold fs-6 mb-2'>ຊື່ໝວດໝູ່</label>
                <input
                  type='text'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder='ຕົວຢ່າງ: ອາຫານ, ເຄື່ອງດື່ມ, ຂອງຫວານ'
                  className='form-control form-control-solid'
                  disabled={savingCategory}
                />
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-light' onClick={() => setShowCategoryModal(false)}>ຍົກເລີກ</button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleCreateCategory}
                  disabled={savingCategory || !newCategoryName.trim()}
                >
                  {savingCategory ? <span className='spinner-border spinner-border-sm me-2' /> : null}
                  ສ້າງ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Categories Modal ────────────────────────────────────────── */}
      {showManageCategoriesModal && (
        <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'><i className='bi bi-gear me-2' />ຈັດການໝວດໝູ່</h5>
                <button
                  type='button' className='btn-close'
                  onClick={() => { setShowManageCategoriesModal(false); setEditingCategory(null); setNewCategoryName('') }}
                />
              </div>
              <div className='modal-body'>
                {loadingCategories ? (
                  <div className='text-center p-10'><div className='spinner-border text-primary' /></div>
                ) : categories.length === 0 ? (
                  <div className='text-center p-10 text-muted'>ຍັງບໍ່ມີໝວດໝູ່</div>
                ) : (
                  <table className='table table-row-bordered align-middle gs-0 gy-3'>
                    <thead>
                      <tr className='fw-bold text-muted'>
                        <th className='w-50px'>#</th>
                        <th>ຊື່</th>
                        <th className='text-end'>ຈັດການ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat, i) => (
                        <tr key={cat.category_id}>
                          <td className='text-gray-800 fw-bold'>{i + 1}</td>
                          <td>
                            {editingCategory?.category_id === cat.category_id ? (
                              <input
                                type='text'
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className='form-control form-control-sm form-control-solid'
                                autoFocus
                              />
                            ) : (
                              <span className='fw-bold fs-6'>{cat.name}</span>
                            )}
                          </td>
                          <td className='text-end'>
                            {editingCategory?.category_id === cat.category_id ? (
                              <>
                                <button
                                  className='btn btn-sm btn-light-success me-1'
                                  onClick={handleUpdateCategory}
                                  disabled={savingCategory || !newCategoryName.trim()}
                                >
                                  {savingCategory
                                    ? <span className='spinner-border spinner-border-sm' />
                                    : <i className='bi bi-check-lg' />}
                                </button>
                                <button
                                  className='btn btn-sm btn-light'
                                  onClick={() => { setEditingCategory(null); setNewCategoryName('') }}
                                >
                                  <i className='bi bi-x-lg' />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                                  onClick={() => { setEditingCategory(cat); setNewCategoryName(cat.name) }}
                                >
                                  <i className='bi bi-pencil fs-4' />
                                </button>
                                <button
                                  className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm'
                                  onClick={() => handleDeleteCategory(cat)}
                                >
                                  <i className='bi bi-trash fs-4' />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className='modal-footer'>
                <button
                  type='button' className='btn btn-light'
                  onClick={() => { setShowManageCategoriesModal(false); setEditingCategory(null); setNewCategoryName('') }}
                >
                  ປິດ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && <UsersListLoading />}
    </>
  )
}

export { UserEditModalForm }