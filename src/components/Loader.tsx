export default function Loader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeMap[size]} border-4 border-dark-200 dark:border-dark-600 border-t-smart-500 rounded-full animate-spin`} />
    </div>
  );
}
