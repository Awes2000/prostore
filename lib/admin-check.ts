import { auth } from '@/auth';

/**
 * Check if the current user has admin role
 * @returns Object with isAdmin boolean and user data
 */
export async function checkAdmin() {
  const session = await auth();

  const isAdmin = session?.user?.role === 'admin';

  return {
    isAdmin,
    user: session?.user || null,
    session,
  };
}

/**
 * Verify admin access and throw if not authorized
 * Use in server actions that require admin role
 */
export async function requireAdmin() {
  const { isAdmin, user } = await checkAdmin();

  if (!user) {
    throw new Error('Authentication required');
  }

  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  return user;
}
