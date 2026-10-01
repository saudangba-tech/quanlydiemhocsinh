import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: { uid: string; displayName: string; email: string };
  loading: boolean;
}

// User mặc định - không cần đăng nhập
const defaultUser = {
  uid: 'default-teacher',
  displayName: 'Giáo viên Toán',
  email: 'teacher@mathclass.pro'
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  loading: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={{ user: defaultUser, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};
