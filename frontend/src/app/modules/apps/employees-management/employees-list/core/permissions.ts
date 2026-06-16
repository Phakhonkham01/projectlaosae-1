// Role-based permissions for the employees-management module.
//
// - owner    : full access — may add/edit any user (owner, employee, customer).
// - employee : may add/edit employees and customers, but may NOT add or edit owners.
// - other    : view-only (cannot add or edit any user).
//
// Read from the same localStorage `user` record used elsewhere in this module.

type Role = 'owner' | 'employee' | 'customer'

const getCurrentUserRole = (): Role | undefined => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw)?.role as Role | undefined) : undefined
  } catch {
    return undefined
  }
}

// True when the current user may manage (create/edit) a user with the given role.
// An employee can manage everyone except owners; an owner can manage everyone.
const canManageRole = (targetRole?: Role): boolean => {
  const role = getCurrentUserRole()
  if (role === 'owner') return true
  if (role === 'employee') return targetRole !== 'owner'
  return false
}

// True when the current user may open the "add user" UI at all.
const canAddUsers = (): boolean => {
  const role = getCurrentUserRole()
  return role === 'owner' || role === 'employee'
}

// True when the current user cannot manage any user (read-only access).
const isViewOnlyUser = (): boolean => !canAddUsers()

export {getCurrentUserRole, canManageRole, canAddUsers, isViewOnlyUser}
