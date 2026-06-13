import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
  index?: number;
}

export default function StatCard({ title, value, icon: Icon, color, trend, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500 dark:text-dark-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-dark-900 dark:text-white">{value}</p>
          {trend && (
            <p className="mt-1 text-sm text-smart-600 dark:text-smart-400 font-medium">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
