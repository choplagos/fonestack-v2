export type AdminRole = 'owner' | 'staff' | 'technician'

export type AdminRoleCapabilities = {
  role: AdminRole
  isOwner: boolean
  canWrite: boolean
  canDelete: boolean
  canOpenSettings: boolean
}

export function normalizeAdminRole(role: string | null | undefined): AdminRole {
  return role === 'staff' || role === 'technician' ? role : 'owner'
}

export function getAdminRoleCapabilities(role: string | null | undefined): AdminRoleCapabilities {
  const effectiveRole = normalizeAdminRole(role)
  const isOwner = effectiveRole === 'owner'
  return {
    role: effectiveRole,
    isOwner,
    canWrite: effectiveRole !== 'technician',
    canDelete: isOwner,
    canOpenSettings: isOwner,
  }
}

export function adminOperationError(error: { message: string }, action: string): string {
  if (/42501|permission|row-level security|policy|not authorized/i.test(error.message)) {
    return `You do not have permission to ${action}.`
  }
  return error.message
}

export function canOpenAdminPath(role: string | null | undefined, pathname: string): boolean {
  const { role: effectiveRole } = getAdminRoleCapabilities(role)
  const ownerOnly = ['/admin/team', '/admin/activity', '/admin/security']
  if (effectiveRole === 'owner') return true
  if (ownerOnly.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return false

  if (effectiveRole === 'staff') {
    return pathname !== '/admin/settings' && !pathname.startsWith('/admin/settings/')
  }

  const technicianPaths = [
    '/admin/inventory',
    '/admin/stock-history',
    '/admin/leads',
    '/admin/trade-ins',
    '/admin/imei',
  ]
  return technicianPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
