import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store';
import { fetchAPI } from '@/lib/fetch';
import { User } from '@/types/type';

interface AuthContextType {
  login: (account: string, password: string) => Promise<User | null>;
  logout: () => void;
  user: User | null;
  token: string | null;
  hasHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setAuth, logout: clearAuth, user, token, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated) {
      console.log('--- 🔑 Trạng thái Đăng nhập ---');
      console.log('Token hiện tại:', token ? `Đã có (Bắt đầu bằng: ${token.substring(0, 10)}...)` : 'Chưa có token (Null/Empty)');

      if (user) {
        console.log('Thông tin người dùng:', {
          id: user.id || 'N/A',
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          phone: user.phone || 'N/A',
          role: user.role || 'N/A'
        });
      } else {
        console.log('ℹ️ Đã tải xong store nhưng không tìm thấy người dùng đăng nhập');
      }
      console.log('-------------------------------');
    }
  }, [user, token, hasHydrated]);

  const login = async (account: string, password: string) => {
    try {
      const isEmail = account.includes('@');
      const payload = {
        [isEmail ? 'email' : 'phone']: account,
        password,
      };
      const response = await fetchAPI('/(api)/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const loginData = response.data;

      if (loginData && loginData.accessToken && loginData.user) {
        setAuth(loginData.accessToken, loginData.user);
        return loginData.user;
      } else {
        throw new Error('Phản hồi đăng nhập không hợp lệ');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ login, logout, user, token, hasHydrated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
