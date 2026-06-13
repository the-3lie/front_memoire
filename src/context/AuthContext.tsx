import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as authApi from '../api/auth';
import { connectSocket, disconnectSocket } from '../socket';

// 🌟 Mise à jour de l'interface pour retourner des Promesses contenant les données de l'API
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  isEquipe: boolean;

  login: (email: string, password: string) => Promise<any>; // 👈 Changé de Promise<void> à Promise<any>

  register: (data: {
    nom: string;
    prenom?: string; // On ajoute le prénom en optionnel pour la flexibilité SQL
    email: string;
    password: string;
    role: string;
  }) => Promise<any>; // 👈 Changé de Promise<void> à Promise<any>

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('smartbin_token');
    const savedUser = localStorage.getItem('smartbin_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        connectSocket(savedToken);
      } catch (error) {
        console.error('Erreur lors du chargement de la session :', error);
        localStorage.removeItem('smartbin_token');
        localStorage.removeItem('smartbin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({
        email,
        password,
      });

      localStorage.setItem('smartbin_token', res.token);
      localStorage.setItem(
        'smartbin_user',
        JSON.stringify(res.user)
      );

      setToken(res.token);
      setUser(res.user);
      connectSocket(res.token);

      return res; // 🌟 CRUCIAL : On retourne 'res' (qui contient { token, user }) pour le Login frontend
    } catch (error) {
      console.error('Erreur de connexion :', error);
      throw error;
    }
  };

  const register = async (data: {
    nom: string;
    prenom?: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const res = await authApi.register(data);

      localStorage.setItem('smartbin_token', res.token);
      localStorage.setItem(
        'smartbin_user',
        JSON.stringify(res.user)
      );

      setToken(res.token);
      setUser(res.user);
      connectSocket(res.token);

      return res; // 🌟 CRUCIAL : On retourne également 'res' après l'inscription
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('smartbin_token');
    localStorage.removeItem('smartbin_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        isAdmin: user?.role === 'admin',
        isEquipe: user?.role === 'equipe',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth doit être utilisé à l’intérieur de AuthProvider'
    );
  }

  return context;
};