import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wrench,
  MessageSquare,
  Bell,
  Rss,
  AlertTriangle,
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
  { to: '/equipe', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/equipe/interventions', icon: Wrench, label: 'Interventions' },
  { to: '/equipe/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/equipe/notifications', icon: Bell, label: 'Notifications' },
  { to: '/equipe/rfid', icon: Rss, label: 'RFID' },
  { to: '/equipe/pannes', icon: AlertTriangle, label: 'Pannes' },
];

export default function EquipeLayout() {
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-amber-600 dark:text-amber-400"
          >
            ÉQUIPE
          </motion.span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `${isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-3 px-4 py-3 rounded-xl' : 'sidebar-link'} ${!sidebarOpen ? 'justify-center' : ''}`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">{item.label}</span>}
            {item.label === 'Notifications' && unreadCount > 0 && sidebarOpen && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-200/50 dark:border-dark-700/50">
        {sidebarOpen && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {user?.nom?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{user?.nom}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 truncate">Équipe intervention</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex">
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex glass-sidebar flex-col fixed top-0 left-0 h-full z-30"
      >
        <SidebarContent />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-full flex items-center justify-center shadow-md hover:bg-dark-50 dark:hover:bg-dark-600 transition-colors"
        >
          <ChevronLeft className={`w-3.5 h-3.5 text-dark-500 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 w-[280px] h-full glass-sidebar z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.main
        animate={{ marginLeft: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 min-h-screen"
      >
        <header className="glass-navbar sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            >
              <Menu className="w-5 h-5 text-dark-700 dark:text-dark-300" />
            </button>
            <h1 className="text-lg font-bold text-dark-900 dark:text-white">Espace Équipe</h1>
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
              onClick={() => navigate('/equipe/notifications')}
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

        <div className="p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
