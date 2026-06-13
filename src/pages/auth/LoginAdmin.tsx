import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 🌟 On récupère la réponse du contexte d'authentification
      const response = await login(email, password);
      
      // 🔄 Redirection dynamique selon le profil SQL obtenu
      if (response?.user?.role === 'admin') {
        navigate('/admin');
      } else if (response?.user?.role === 'equipe') {
        navigate('/equipe'); // Redirige vers l'espace équipe si un intervenant se trompe de page
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      // Intercepte l'erreur MySQL personnalisée du backend
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 lg:hidden">
        <div className="w-10 h-10 bg-smart-500 rounded-xl flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gradient">SMART BIN</span>
      </div>

      <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
        Connexion Admin
      </h2>
      <p className="text-dark-500 dark:text-dark-400 mb-8">
        Accédez à votre espace administrateur
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartbin.com"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-dark-500 dark:text-dark-400">
          Pas encore de compte ?{' '}
          <Link to="/auth/register" className="text-smart-600 dark:text-smart-400 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
        <Link
          to="/auth/login-equipe"
          className="inline-flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          Connexion équipe d'intervention →
        </Link>
      </div>
    </div>
  );
}