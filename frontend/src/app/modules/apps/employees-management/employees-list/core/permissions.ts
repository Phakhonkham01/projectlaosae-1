// Role-based permissions for the employees-management module.
// An `employee` may only VIEW user details — they cannot create, edit, or delete
// any user (customer, owner, or other). Read from the same localStorage `user`
// record used elsewhere in this module.

const getCurrentUserRole = (): string | undefined => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw)?.role as string | undefined) : undefined
  } catch {
    return undefined
  }
}

// True when the logged-in user is an employee (view-only access).
const isViewOnlyUser = (): boolean => getCurrentUserRole() === 'employee'

export {getCurrentUserRole, isViewOnlyUser}
