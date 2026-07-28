/**
 * Centralized role-to-route mapping.
 * Single source of truth for all role-based redirects across the app.
 */
export const ROLE_ROUTES = {
  admin: '/admin',
  instructor: '/instructor',
  student: '/student/dashboard',
  receptionist: '/receptionist',
};

/**
 * Returns the home route for a given role.
 * Falls back to '/' for unknown roles.
 * @param {string|undefined} role
 * @returns {string}
 */
export const getRouteByRole = (role) => ROLE_ROUTES[role] ?? '/';
