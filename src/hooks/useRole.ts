'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useRole() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  
  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };
  
  const canAccessAdmin = () => isAdmin;
  
  return {
    user,
    isAdmin,
    isUser,
    hasRole,
    canAccessAdmin,
  };
}
