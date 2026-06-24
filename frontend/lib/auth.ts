export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'PENGAWAS' | 'ADMIN_PROYEK' | 'MANDOR' | 'KONSUMEN' | 'ARSITEK' | 'ESTIMATOR' | 'DRAFTER';
  language: 'ID' | 'EN';
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getRedirectPath = (role: string): string => {
  const paths: Record<string, string> = {
    SUPER_ADMIN: '/dashboard/admin',
    MANAGER: '/dashboard/manager',
    PENGAWAS: '/dashboard/pengawas',
    ADMIN_PROYEK: '/dashboard/admin',
    MANDOR: '/dashboard/mandor',
    KONSUMEN: '/dashboard/konsumen',
    ARSITEK: '/dashboard/professional',
    ESTIMATOR: '/dashboard/professional',
    DRAFTER: '/dashboard/professional',
  };
  return paths[role] || '/login';
};
