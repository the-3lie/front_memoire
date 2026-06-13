import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sun, Moon, Bell, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AdminParametres() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifEnabled, setNotifEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Configuration de votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-smart-500/10">
              <User className="w-5 h-5 text-smart-600 dark:text-smart-400" />
            </div>
            <h3 className="section-title">Profil</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <p className="text-xs text-dark-500 mb-1">Nom</p>
              <p className="font-semibold text-dark-900 dark:text-white">{user?.nom}</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <p className="text-xs text-dark-500 mb-1">Email</p>
              <p className="font-semibold text-dark-900 dark:text-white">{user?.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <p className="text-xs text-dark-500 mb-1">Rôle</p>
              <span className="badge bg-smart-100 text-smart-700 dark:bg-smart-900/30 dark:text-smart-400">Administrateur</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-smart-500/10">
              <Settings className="w-5 h-5 text-smart-600 dark:text-smart-400" />
            </div>
            <h3 className="section-title">Préférences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-dark-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Mode sombre</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-smart-500' : 'bg-dark-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-dark-400" />
                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Notifications</span>
              </div>
              <button
                onClick={() => setNotifEnabled(!notifEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${notifEnabled ? 'bg-smart-500' : 'bg-dark-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-dark-400" />
                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Sécurité</span>
              </div>
              <p className="text-xs text-dark-500 dark:text-dark-400">Jeton JWT actif. Votre session est sécurisée.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
