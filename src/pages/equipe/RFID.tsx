import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import api from '../../api/axios'; // Ton instance Axios configurée

export default function EquipeEnregistrerPoubelle() {
  const [cartesEnAttente, setCartesEnAttente] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // L'état du formulaire utilise maintenant directement rfid_uid comme pivot central de la requête POST
  const [form, setForm] = useState({ rfid_uid: '', nom: '', latitude: '', longitude: '' });
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');

  // Charger les UID scannés par l'Arduino qui attendent leurs coordonnées
  const chargerCartesEnAttente = async () => {
    try {
      // Appel de la route gérée par getCartesEnAttente
      const res = await api.get('/poubelles');
      console.log("📥 Données brutes reçues de la BDD (cartes en attente) :", res.data);
      
      if (Array.isArray(res.data)) {
        setCartesEnAttente(res.data);
      }
    } catch (err) {
      console.error("❌ Erreur de chargement des cartes rfid :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerCartesEnAttente();
  }, []);

  const handleEnregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSucces('');
    setMessageErreur('');

    // Vérification stricte des champs obligatoires requis par createPoubelle
    if (!form.rfid_uid || !form.nom || !form.latitude || !form.longitude) {
      setMessageErreur("Veuillez remplir tous les champs avant d'activer la poubelle.");
      return;
    }

    try {
      // 🛠️ ALIGNÉ SUR TON CONTROLEUR (createPoubelle) : Envoi en POST sur /poubelles
      const res = await api.post('/poubelles', {
        rfid_uid: form.rfid_uid,
        nom: form.nom,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      });

      if (res.data.success) {
        setMessageSucces(`La poubelle "${form.nom}" a été configurée et activée avec succès !`);
        setForm({ rfid_uid: '', nom: '', latitude: '', longitude: '' });
        
        // Rechargement immédiat pour épurer la liste déroulante du badge configuré
        await chargerCartesEnAttente();
      }

      // Effacer le message de succès après 4 secondes
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err: any) {
      console.error("❌ Erreur d'activation :", err);
      setMessageErreur(err.response?.data?.error || "Une erreur est survenue lors de l'activation.");
    }
  };

  if (loading) return <div className="text-center py-10">🔄 Recherche des signaux RFID en attente...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Déploiement SmartTrash</h1>
        <p className="text-dark-500 mt-1">Associer une carte RFID détectée à un emplacement physique</p>
      </div>

      {messageSucces && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-100 text-emerald-800 rounded-xl font-medium text-sm"
        >
          {messageSucces}
        </motion.div>
      )}

      {messageErreur && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-rose-100 text-rose-800 rounded-xl font-medium text-sm"
        >
          {messageErreur}
        </motion.div>
      )}

      <form onSubmit={handleEnregistrer} className="glass-card p-6 space-y-4">
        {/* 1. SÉLECTEUR DE CARTES SCANNÉES */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Signaux RFID détectés sur le terrain ({cartesEnAttente.length} en attente)
          </label>
          <select
            value={form.rfid_uid}
            onChange={(e) => setForm({ ...form, rfid_uid: e.target.value })}
            className="input-field w-full"
            required
          >
            <option value="">-- Choisir un numéro RFID en attente --</option>
            {cartesEnAttente.map((carte) => (
              // Lecture de la clé rfid_uid formatée par la fonction getCartesEnAttente du contrôleur
              <option key={carte.id || carte._id} value={carte.rfid_uid}>
                Badge ID : {carte.rfid_uid}
              </option>
            ))}
          </select>
          <p className="text-xs text-dark-400 mt-1">
            💡 Passez d'abord la carte devant l'appareil pour qu'elle apparaisse dans cette liste.
          </p>
        </div>

        {/* 2. NOM DE LA STATION */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nom de la poubelle</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="Ex: SmartTrash N°4 - Carrefour Jeunesse"
            className="input-field w-full"
            required
          />
        </div>

        {/* 3. COORDONNÉES GÉOGRAPHIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="Ex: 5.34843"
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="Ex: -4.01952"
              className="input-field w-full"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-smart-500 hover:bg-smart-600 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 mt-4"
        >
          <Save className="w-5 h-5" />
          Activer et Initialiser les Capteurs
        </button>
      </form>
    </div>
  );
}