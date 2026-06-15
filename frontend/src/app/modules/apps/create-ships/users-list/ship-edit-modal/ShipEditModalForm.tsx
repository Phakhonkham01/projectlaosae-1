import { FC, useState, useEffect, useRef } from 'react'
import { useQueryClient, useMutation } from 'react-query'
import { useListView } from '../core/ListViewProvider'
import { useQueryResponse } from '../core/QueryResponseProvider'
import { createShip, updateShip, getShipById } from '../core/ship_requests'
import { ShipData } from '../core/ship_models'
import { KTIcon, QUERIES } from '../../../../../../_metronic/helpers'
import Swal from 'sweetalert2'
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../../../../../../../../firebase/useFirebase'

const ShipEditModalForm: FC = () => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView()
  const { refetch } = useQueryResponse()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ShipData>({
    ship_name: '',
    capacity: 0,
    image_url: '',
    price: 0,
    quantity: 0,
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load data when editing
  useEffect(() => {
    if (itemIdForUpdate) {
      const fetchShipData = async () => {
        try {
          setLoading(true)
          const shipRef = doc(db, 'ships', itemIdForUpdate)
          const shipSnap = await getDoc(shipRef)
          
          if (shipSnap.exists()) {
            const shipData = shipSnap.data() as ShipData
            setFormData({
              ...shipData,
              id: shipSnap.id,
              updatedAt: new Date().toISOString(),
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ຜິດພາດ!',
              text: 'ບໍ່ພົບຂໍ້ມູນເຮືອ',
            })
            setItemIdForUpdate(undefined)
          }
        } catch (error) {
          console.error('Error fetching ship:', error)
          Swal.fire({
            icon: 'error',
            title: 'ຜິດພາດ!',
            text: 'ໂຫຼດຂໍ້ມູນເຮືອບໍ່ສຳເລັດ',
          })
        } finally {
          setLoading(false)
        }
      }
      fetchShipData()
    } else {
      // Reset form for create
      setFormData({
        ship_name: '',
        capacity: 0,
        image_url: '',
        price: 0,
        quantity: 0,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }, [itemIdForUpdate, setItemIdForUpdate])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ!',
        text: 'ກະລຸນາອັບໂຫຼດໄຟລ໌ຮູບພາບ',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ!',
        text: 'ຂະໜາດຮູບພາບຕ້ອງນ້ອຍກວ່າ 5MB',
      })
      return
    }

    setUploadingImage(true)

    try {
      // Create a unique filename
      const timestamp = Date.now()
      const filename = `ships/${timestamp}_${file.name}`
      const storageRef = ref(storage, filename)

      // Upload file
      await uploadBytes(storageRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef)

      // If there's an existing image and we're editing, delete the old one
      if (itemIdForUpdate && formData.image_url) {
        try {
          const oldImageRef = ref(storage, formData.image_url)
          await deleteObject(oldImageRef)
        } catch (error) {
          console.log('Old image not found or already deleted:', error)
        }
      }

      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        image_url: downloadURL
      }))

      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ!',
        text: 'ອັບໂຫຼດຮູບພາບສຳເລັດ',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ!',
        text: 'ອັບໂຫຼດຮູບພາບບໍ່ສຳເລັດ',
      })
    } finally {
      setUploadingImage(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle remove image
  const handleRemoveImage = async () => {
    if (!formData.image_url) return

    try {
      // Delete from storage
      const imageRef = ref(storage, formData.image_url)
      await deleteObject(imageRef)

      // Update form data
      setFormData(prev => ({
        ...prev,
        image_url: ''
      }))

      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ!',
        text: 'ລຶບຮູບພາບສຳເລັດ',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error removing image:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ!',
        text: 'ລຶບຮູບພາບບໍ່ສຳເລັດ',
      })
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.ship_name.trim()) {
      newErrors.ship_name = 'ກະລຸນາໃສ່ຊື່ເຮືອ'
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'ຄວາມຈຸຕ້ອງຫຼາຍກວ່າ 0'
    }

    if (formData.price <= 0) {
      newErrors.price = 'ລາຄາຕ້ອງຫຼາຍກວ່າ 0'
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'ຈຳນວນຕ້ອງບໍ່ຕິດລົບ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Create mutation
  const createMutation = useMutation(
    async () => {
      const docRef = await addDoc(collection(db, 'ships'), {
        ship_name: formData.ship_name,
        capacity: formData.capacity,
        image_url: formData.image_url,
        price: formData.price,
        quantity: formData.quantity,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return { id: docRef.id, ...formData }
    },
    {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'ສຳເລັດ!',
          text: 'ສ້າງເຮືອສຳເລັດ',
          timer: 2000,
          showConfirmButton: false,
        })
        queryClient.invalidateQueries(`${QUERIES.USERS_LIST}-ships`)
        refetch()
        setItemIdForUpdate(undefined)
      },
      onError: (error: any) => {
        console.error('Create error:', error)
        Swal.fire({
          icon: 'error',
          title: 'ຜິດພາດ!',
          text: error.message || 'ສ້າງເຮືອບໍ່ສຳເລັດ',
        })
      },
    }
  )

  // Update mutation
  const updateMutation = useMutation(
    async () => {
      if (!itemIdForUpdate) throw new Error('ບໍ່ພົບ ID ຂອງເຮືອ')
      
      const shipRef = doc(db, 'ships', itemIdForUpdate)
      await updateDoc(shipRef, {
        ship_name: formData.ship_name,
        capacity: formData.capacity,
        image_url: formData.image_url,
        price: formData.price,
        quantity: formData.quantity,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      })
      
      return { id: itemIdForUpdate, ...formData }
    },
    {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'ສຳເລັດ!',
          text: 'ອັບເດດເຮືອສຳເລັດ',
          timer: 2000,
          showConfirmButton: false,
        })
        queryClient.invalidateQueries(`${QUERIES.USERS_LIST}-ships`)
        refetch()
        setItemIdForUpdate(undefined)
      },
      onError: (error: any) => {
        console.error('Update error:', error)
        Swal.fire({
          icon: 'error',
          title: 'ຜິດພາດ!',
          text: error.message || 'ອັບເດດເຮືອບໍ່ສຳເລັດ',
        })
      },
    }
  )

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (itemIdForUpdate) {
        await updateMutation.mutateAsync()
      } else {
        await createMutation.mutateAsync()
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Select the "0" on focus so typing replaces it instead of appending
  const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) === 0) {
      e.target.select()
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: ['capacity', 'price', 'quantity'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="modal-content">
      {/* Modal Header */}
      <div className="modal-header">
        <h2 className="fw-bold">
          {itemIdForUpdate ? 'ແກ້ໄຂເຮືອ' : 'ເພີ່ມເຮືອໃໝ່'}
        </h2>
        <div
          className="btn btn-icon btn-sm btn-active-icon-primary"
          onClick={() => setItemIdForUpdate(undefined)}
          style={{ cursor: 'pointer' }}
        >
          <KTIcon iconName="cross" className="fs-1" />
        </div>
      </div>

      {/* Modal Body */}
      <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
        <form id="ship_form" onSubmit={handleSubmit}>
          {/* Ship Name (replaces both Name and Ship Name) */}
          <div className="mb-7">
            <label className="required fw-bold fs-6 mb-2">ຊື່ເຮືອ</label>
            <input
              type="text"
              name="ship_name"
              className={`form-control form-control-solid mb-3 mb-lg-0 ${errors.ship_name ? 'is-invalid' : ''}`}
              placeholder="ປ້ອນຊື່ເຮືອ"
              value={formData.ship_name}
              onChange={handleChange}
              disabled={loading || uploadingImage}
            />
            {errors.ship_name && (
              <div className="invalid-feedback d-block">{errors.ship_name}</div>
            )}
          </div>

          {/* Capacity */}
          <div className="mb-7">
            <label className="required fw-bold fs-6 mb-2">ຄວາມຈຸ</label>
            <input
              type="number"
              name="capacity"
              className={`form-control form-control-solid mb-3 mb-lg-0 ${errors.capacity ? 'is-invalid' : ''}`}
              placeholder="ປ້ອນຄວາມຈຸ"
              value={formData.capacity}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              min="0"
              step="1"
              disabled={loading || uploadingImage}
            />
            {errors.capacity && (
              <div className="invalid-feedback d-block">{errors.capacity}</div>
            )}
          </div>

          {/* Price */}
          <div className="mb-7">
            <label className="required fw-bold fs-6 mb-2">ລາຄາ</label>
            <input
              type="number"
              name="price"
              className={`form-control form-control-solid mb-3 mb-lg-0 ${errors.price ? 'is-invalid' : ''}`}
              placeholder="ປ້ອນລາຄາ"
              value={formData.price}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              min="0"
              step="0.01"
              disabled={loading || uploadingImage}
            />
            {errors.price && (
              <div className="invalid-feedback d-block">{errors.price}</div>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-7">
            <label className="required fw-bold fs-6 mb-2">ຈຳນວນ</label>
            <input
              type="number"
              name="quantity"
              className={`form-control form-control-solid mb-3 mb-lg-0 ${errors.quantity ? 'is-invalid' : ''}`}
              placeholder="ປ້ອນຈຳນວນ"
              value={formData.quantity}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              min="0"
              step="1"
              disabled={loading || uploadingImage}
            />
            {errors.quantity && (
              <div className="invalid-feedback d-block">{errors.quantity}</div>
            )}
          </div>

          {/* Image Upload */}
          <div className="mb-7">
            <label className="fw-bold fs-6 mb-2">ຮູບເຮືອ</label>
            
            {/* Image Preview */}
            {formData.image_url && (
              <div className="mb-3">
                <div className="position-relative d-inline-block">
                  <img
                    src={formData.image_url}
                    alt="ຕົວຢ່າງຮູບເຮືອ"
                    className="img-thumbnail"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-icon btn-light-danger position-absolute top-0 end-0"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                  >
                    <KTIcon iconName="cross" className="fs-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Controls */}
            <div className="d-flex align-items-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="d-none"
                disabled={uploadingImage}
              />
              
              <button
                type="button"
                className="btn btn-light-primary me-3"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    ກຳລັງອັບໂຫຼດ...
                  </>
                ) : (
                  <>
                    <KTIcon iconName="folder-up" className="fs-2 me-2" />
                    {formData.image_url ? 'ປ່ຽນຮູບພາບ' : 'ອັບໂຫຼດຮູບພາບ'}
                  </>
                )}
              </button>

              {formData.image_url && (
                <span className="text-success">
                  <KTIcon iconName="check-circle" className="fs-2 me-1" />
                  ອັບໂຫຼດຮູບພາບແລ້ວ
                </span>
              )}
            </div>

            <div className="form-text text-muted mt-2">
              ຮອງຮັບ: JPG, PNG, GIF. ຂະໜາດສູງສຸດ: 5MB
            </div>
          </div>

          {/* Status */}
          <div className="mb-7">
            <label className="required fw-bold fs-6 mb-2">ສະຖານະ</label>
            <select
              name="status"
              className="form-select form-select-solid"
              value={formData.status}
              onChange={handleChange}
              disabled={loading || uploadingImage}
            >
              <option value="Active">ພ້ອມໃຊ້ງານ</option>
              <option value="Inactive">ບໍ່ພ້ອມໃຊ້ງານ</option>
              <option value="Maintenance">ກຳລັງບຳລຸງຮັກສາ</option>
            </select>
          </div>
        </form>
      </div>

      {/* Modal Footer */}
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-light"
          onClick={() => setItemIdForUpdate(undefined)}
          disabled={loading || uploadingImage}
        >
          ຍົກເລີກ
        </button>
        <button
          type="submit"
          form="ship_form"
          className="btn btn-primary"
          disabled={loading || uploadingImage}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              {itemIdForUpdate ? 'ກຳລັງອັບເດດ...' : 'ກຳລັງສ້າງ...'}
            </>
          ) : (
            <>{itemIdForUpdate ? 'ອັບເດດເຮືອ' : 'ສ້າງເຮືອ'}</>
          )}
        </button>
      </div>
    </div>
  )
}

export { ShipEditModalForm }
