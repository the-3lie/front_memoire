export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'vide': return 'bg-smart-500';
    case 'en cours': return 'bg-amber-500';
    case 'pleine': return 'bg-red-500';
    case 'panne': return 'bg-dark-600';
    default: return 'bg-dark-400';
  }
};

export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'vide': return 'status-vide';
    case 'en cours': return 'status-en-cours';
    case 'pleine': return 'status-pleine';
    case 'panne': return 'status-panne';
    default: return 'badge';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'vide': return 'Vide';
    case 'en cours': return 'En cours';
    case 'pleine': return 'Pleine';
    case 'panne': return 'Panne';
    case 'en attente': return 'En attente';
    case 'terminée': return 'Terminée';
    case 'annulée': return 'Annulée';
    case 'signalée': return 'Signalée';
    case 'résolue': return 'Résolue';
    default: return status;
  }
};

export const getNiveauColor = (niveau: number): string => {
  if (niveau < 30) return 'text-smart-500';
  if (niveau < 70) return 'text-amber-500';
  return 'text-red-500';
};

export const getNiveauBgColor = (niveau: number): string => {
  if (niveau < 30) return 'bg-smart-500';
  if (niveau < 70) return 'bg-amber-500';
  return 'bg-red-500';
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return formatDate(dateStr);
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
