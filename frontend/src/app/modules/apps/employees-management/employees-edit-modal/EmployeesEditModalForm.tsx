import { FC, useState, useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useListView } from '../../../../../../../../../../../../../../core/ListViewProvider'
import { useQueryResponse } from '../../../../../../../core/QueryResponseProvider'
import { createUser, updateUser, getUserById } from '../../core/_requests'
import { User } from '../../core/_models'
import { KTIcon, QUERIES } from '../../../../../../../_metronic/helpers'
import Swal from 'sweetalert2'

const EmployeesEditModalForm: FC = () => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView()
  const { refetch } = useQueryResponse()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (itemIdForUpdate) {
      // Fetch data
    }
  }, [itemIdForUpdate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle submit
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {/* Form fields */}
      <div className="text-center pt-15">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export { EmployeesEditModalForm }