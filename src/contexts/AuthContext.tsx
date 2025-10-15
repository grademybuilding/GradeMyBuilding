import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AppRole, UserCredentials, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    role: AppRole,
    credentials: UserCredentials
  ) => {
    // CLIENT-SIDE DEMO ONLY - NOT SECURE FOR PRODUCTION
    const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
    
    if (users[email]) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      credentials,
      role,
      credentials_verified: false,
      created_at: new Date().toISOString(),
    };

    users[email] = { ...newUser, password };
    localStorage.setItem('demo_users', JSON.stringify(users));
    localStorage.setItem('demo_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    // CLIENT-SIDE DEMO ONLY - NOT SECURE FOR PRODUCTION
    const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
    const userData = users[email];

    if (!userData || userData.password !== password) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...user } = userData;
    localStorage.setItem('demo_user', JSON.stringify(user));
    setUser(user);
  };

  const signOut = async () => {
    localStorage.removeItem('demo_user');
    setUser(null);
  };

  const hasRole = (role: AppRole): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
