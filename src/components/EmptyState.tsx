import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-4 rounded-2xl bg-dark-100 dark:bg-dark-800 mb-4">
        <Icon className="w-10 h-10 text-dark-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300">{title}</h3>
      <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">{description}</p>
    </motion.div>
  );
}
