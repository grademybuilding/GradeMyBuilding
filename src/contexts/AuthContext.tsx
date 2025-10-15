import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRole = 'admin' | 'inspector' | 'appraiser' | 'real_estate_agent' | 'assessor' | 'underwriter';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  company_email?: string;
  license_number?: string;
  license_state?: string;
  credentials_verified: boolean;
  role: AppRole;
}

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  signUp: (data: Omit<Profile, 'id' | 'credentials_verified'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signUp = async (data: Omit<Profile, 'id' | 'credentials_verified'>) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: Profile = {
      ...data,
      id: crypto.randomUUID(),
      credentials_verified: false,
    };

    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem(`auth_password_${data.email}`, 'stored'); // Mock password storage
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const storedPassword = localStorage.getItem(`auth_password_${email}`);
    if (!storedPassword) {
      throw new Error('Invalid email or password');
    }

    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.email === email) {
        setUser(userData);
        return;
      }
    }
    
    throw new Error('Invalid email or password');
  };

  const signOut = async () => {
    setUser(null);
  };

  const hasRole = (role: AppRole) => {
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
