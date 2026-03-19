import {UsersListFilter} from './UsersListFilter'

const UsersListToolbar = () => {
  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      <UsersListFilter />
    </div>
  )
}

export {UsersListToolbar}
