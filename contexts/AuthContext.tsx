
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

// Mock user data for demonstration
export const AVAILABLE_ACCOUNTS: User[] = [
  { id: 'lib1', name: 'Head Librarian', email: 'librarian@istanbulint.com', role: UserRole.Librarian },
  { id: 's1', name: 'Abdurrahman Tolay', email: 'abdurrahman.tolay@istanbulint.com', role: UserRole.Student },
  { id: 's2', name: 'Alex Student', email: 'student@istanbulint.com', role: UserRole.Student },
];

interface AuthContextType {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  availableAccounts: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start with no user logged in so you can choose which account to use
  const [user, setUser] = useState<User | null>(null);

  // Mock sign-in function that validates the email domain
  const signIn = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.toLowerCase().endsWith('@istanbulint.com')) {
          reject(new Error('Access denied. Please use an @istanbulint.com email address.'));
          return;
        }
        
        // Find existing user or create a temporary session for a new valid email
        const foundUser = AVAILABLE_ACCOUNTS.find(u => u.email.toLowerCase() === email.toLowerCase()) 
            || { id: `new-${Date.now()}`, name: email.split('@')[0], email: email, role: UserRole.Student };
            
        setUser(foundUser);
        resolve();
      }, 800); // Slight delay for realism
    });
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, availableAccounts: AVAILABLE_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
