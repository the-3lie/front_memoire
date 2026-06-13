import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Trash2,
  Users,
  Wrench,
  Bell,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/poubelles', icon: Trash2, label: 'Poubelles' },
  { to: '/admin/equipes', icon: Users, label: 'Équipes' },
  { to: '/admin/interventions', icon: Wrench, label: 'Interventions' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/carte', icon: MapPin, label: 'Carte' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/pannes', icon: AlertTriangle, label: 'Pannes' },
  { to: '/admin/parametres', icon: Settings, label: 'Paramètres' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 🌟 STRUCTURÉ : Utilisation de justify-between pour forcer la déconnexion en bas
  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-smart-500 rounded-xl flex items-center justify-center glow-green shrink-0">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold text-gradient truncate"
            >
              SMART BIN
            </motion.span>
          )}
        </div>

        {/* Liens de navigation défilants si l'écran est petit */}
        <nav className="px-3 space-y-1 mt-4 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `${isActive ? 'sidebar-link-active' : 'sidebar-link'} ${!sidebarOpen ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
              {item.label === 'Notifications' && unreadCount > 0 && sidebarOpen && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* 🌟 BLOC DU BAS : Totalement isolé pour ne plus jamais glisser sous le contenu */}
      <div className="p-4 border-t border-dark-200/50 dark:border-dark-700/50 bg-white dark:bg-dark-900 sticky bottom-0">
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 mb-4 p-1 rounded-xl">
            <div className="w-9 h-9 bg-smart-500/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-smart-600 dark:text-smart-400">
                {user?.nom?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-800 dark:text-dark-200 truncate">{user?.nom}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium active:scale-95 ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span className="text-sm">Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex relative overflow-x-hidden">
      
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex glass-sidebar flex-col fixed top-0 left-0 bottom-0 h-screen z-30 border-r border-dark-200/40 dark:border-dark-800/40"
      >
        <SidebarContent />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-full flex items-center justify-center shadow-md hover:bg-dark-50 dark:hover:bg-dark-600 transition-colors z-40"
        >
          <ChevronLeft className={`w-3.5 h-3.5 text-dark-500 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 bottom-0 left-0 w-[280px] h-screen bg-white dark:bg-dark-900 z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 z-50"
              >
                <X className="w-5 h-5 text-dark-700 dark:text-dark-300" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content frame */}
      <motion.main
        animate={{ paddingLeft: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-w-0 w-full"
      >
        {/* Top navbar */}
        <header className="glass-navbar sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b border-dark-200/30 dark:border-dark-800/30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            >
              <Menu className="w-5 h-5 text-dark-700 dark:text-dark-300" />
            </button>
            <h1 className="text-lg font-bold text-dark-900 dark:text-white">Espace Administrateur</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-dark-600" />
              )}
            </button>
            <button
              onClick={() => navigate('/admin/notifications')}
              className="relative p-2.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-dark-600 dark:text-dark-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page children container */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}