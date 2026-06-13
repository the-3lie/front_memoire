export interface User {
  _id: string;
  nom: string;
  email: string;
  role: 'admin' | 'equipe';
  createdAt: string;
}

export interface Poubelle {
  _id: string;
  rfidUid: string;
  nom: string;
  latitude: number;
  longitude: number;
  niveau: number;
  statut: 'vide' | 'en cours' | 'pleine' | 'panne';
  equipe?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipe {
  id?: number;          // 🌟 Pour MySQL (INT AUTO_INCREMENT)
  _id?: string;         // Pour l'ancien MongoDB
  nom_equipe?: string;  // 🌟 Pour MySQL (VARCHAR)
  nom?: string;         // Pour MongoDB
  localite?: string;    // 🌟 Pour MySQL
  zone?: string;        // Pour MongoDB
  telephone_chef?: string; // 🌟 Pour MySQL
  telephone?: string;   // Pour MongoDB
  email?: string;
  membres?: number | string;
  createdAt?: string;
  created_at?: string;
}

export interface Intervention {
  _id: string;
  poubelle: string | Poubelle;
  equipe: string | Equipe;
  statut: 'en attente' | 'en cours' | 'terminée' | 'annulée';
  description: string;
  dateDebut: string;
  dateFin?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  expediteur: string | User;
  destinataire: string | User;
  contenu: string;
  lu: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: 'alerte' | 'info' | 'panne' | 'intervention';
  titre: string;
  message: string;
  lu: boolean;
  destinataire: string;
  createdAt: string;
}

export interface Panne {
  _id: string;
  poubelle: string | Poubelle;
  description: string;
  statut: 'signalée' | 'en cours' | 'résolue';
  signaléePar: string | User;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
