import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterAdmin() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState(''); // 🎉 Ajout du state pour le prénom
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Envoi de l'objet complet avec nom, prenom et role 'admin'
      await register({ nom, prenom, email, password, role: 'admin' });
      navigate('/admin');
    } catch (err: any) {
      // Correction pour intercepter le { error: "..." } envoyé par Node.js
      setError(err.response?.data?.error || err.response?.data?.message || "Erreur d'inscription");
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
        Inscription Admin
      </h2>
      <p className="text-dark-500 dark:text-dark-400 mb-8">
        Créez votre compte administrateur
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
        {/* Champ Nom */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Nom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Guei"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Champ Prénom */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Prénom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Henoc"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Champ Email */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Email</label>
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

        {/* Champ Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-10 pr-10"
              required
              minLength={6}
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
            "S'inscrire"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-dark-500 dark:text-dark-400">
          Déjà inscrit ?{' '}
          <Link to="/auth/login" className="text-smart-600 dark:text-smart-400 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}