import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-smart-50/30 to-dark-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-smart-600 to-smart-800 items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-smart-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 glow-green-strong">
              <Trash2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-4">SMART BIN</h1>
            <p className="text-xl text-smart-100 font-light leading-relaxed">
              Plateforme intelligente de gestion des poubelles connectées pour la Smart City
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-smart-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-smart-300 rounded-full" />
                <span>Surveillance temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-smart-300 rounded-full" />
                <span>Gestion IoT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-smart-300 rounded-full" />
                <span>Interventions auto</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-6">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-dark-800/50 transition-colors glass"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-dark-600" />}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
