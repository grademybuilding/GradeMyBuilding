export type AppRole = 
  | 'admin'
  | 'inspector'
  | 'appraiser'
  | 'real_estate_agent'
  | 'assessor'
  | 'underwriter';

export interface UserCredentials {
  full_name: string;
  phone?: string;
  company_name: string;
  company_email?: string;
  license_number?: string;
  license_state?: string;
}

export interface User {
  id: string;
  email: string;
  credentials: UserCredentials;
  role: AppRole;
  credentials_verified: boolean;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: AppRole, credentials: UserCredentials) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}
