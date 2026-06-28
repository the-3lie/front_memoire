import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Search, MapPin, Loader2 } from 'lucide-react';
import api from '../../api/axios'; // Ton instance Axios configurée

export default function EquipeEnregistrerPoubelle() {
  const [cartesEnAttente, setCartesEnAttente] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // L'état du formulaire utilise maintenant directement rfid_uid comme pivot central de la requête POST
  const [form, setForm] = useState({ rfid_uid: '', nom: '', latitude: '', longitude: '' });
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');

  // 🌟 NOUVEAU : champ de recherche de lieu (nom de ville/adresse), séparé du
  // nom de la poubelle, et état de la recherche de géocodage.
  const [lieuRecherche, setLieuRecherche] = useState('');
  const [recherchEnCours, setRecherchEnCours] = useState(false);
  const [resultatsRecherche, setResultatsRecherche] = useState<any[]>([]);
  const [messageRecherche, setMessageRecherche] = useState('');

  // Charger les UID scannés par l'Arduino qui attendent leurs coordonnées
  const chargerCartesEnAttente = async () => {
    try {
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

  // 🌟 NOUVEAU : appelle l'API gratuite Nominatim (OpenStreetMap) pour convertir
  // un nom de lieu/ville en coordonnées GPS. Pas de clé API nécessaire.
  // On limite à 5 résultats pour laisser l'utilisateur choisir si le nom est ambigu
  // (ex: plusieurs villes "Bouaké" ou quartiers homonymes).
  const handleRechercherLieu = async () => {
    if (!lieuRecherche.trim()) {
      setMessageRecherche("Tape un nom de ville ou d'adresse avant de rechercher.");
      return;
    }

    setRecherchEnCours(true);
    setMessageRecherche('');
    setResultatsRecherche([]);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(lieuRecherche.trim())}`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'fr',
        },
      });

      if (!res.ok) throw new Error('Erreur réseau lors de la recherche du lieu.');

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setMessageRecherche("Aucun lieu trouvé pour cette recherche. Essaie d'être plus précis (ex: ajoute le pays).");
        return;
      }

      if (data.length === 1) {
        appliquerResultat(data[0]);
      } else {
        setResultatsRecherche(data);
      }
    } catch (err) {
      console.error('❌ Erreur de géocodage :', err);
      setMessageRecherche("Impossible de contacter le service de localisation. Vérifie ta connexion internet.");
    } finally {
      setRecherchEnCours(false);
    }
  };

  // 🌟 Remplit latitude/longitude à partir d'un résultat Nominatim choisi
  const appliquerResultat = (resultat: any) => {
    setForm((prev) => ({
      ...prev,
      latitude: String(parseFloat(resultat.lat).toFixed(6)),
      longitude: String(parseFloat(resultat.lon).toFixed(6)),
    }));
    setResultatsRecherche([]);
    setMessageRecherche(`Position trouvée : ${resultat.display_name}`);
  };

  const handleEnregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSucces('');
    setMessageErreur('');

    if (!form.rfid_uid || !form.nom || !form.latitude || !form.longitude) {
      setMessageErreur("Veuillez remplir tous les champs avant d'activer la poubelle.");
      return;
    }

    try {
      const res = await api.post('/poubelles', {
        rfid_uid: form.rfid_uid,
        nom: form.nom,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      });

      if (res.data.success) {
        setMessageSucces(`La poubelle "${form.nom}" a été configurée et activée avec succès !`);
        setForm({ rfid_uid: '', nom: '', latitude: '', longitude: '' });
        setLieuRecherche('');
        setMessageRecherche('');
        await chargerCartesEnAttente();
      }

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

        {/* 3. 🌟 NOUVEAU : RECHERCHE AUTOMATIQUE DE LOCALISATION */}
        <div className="p-4 bg-smart-50 dark:bg-smart-900/10 rounded-xl border border-smart-200 dark:border-smart-800/50 space-y-3">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
            🌍 Rechercher la position automatiquement
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={lieuRecherche}
              onChange={(e) => setLieuRecherche(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRechercherLieu();
                }
              }}
              placeholder="Ex: Cocody, Abidjan ou Marché de Treichville"
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={handleRechercherLieu}
              disabled={recherchEnCours}
              className="bg-smart-500 hover:bg-smart-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
            >
              {recherchEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Rechercher
            </button>
          </div>

          {messageRecherche && (
            <p className="text-xs text-dark-500 dark:text-dark-400 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {messageRecherche}
            </p>
          )}

          {/* 🌟 Liste de choix si plusieurs lieux correspondent au nom tapé */}
          {resultatsRecherche.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-xs text-dark-500 dark:text-dark-400">Plusieurs lieux trouvés, choisis le bon :</p>
              {resultatsRecherche.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => appliquerResultat(res)}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-white dark:bg-dark-800 hover:bg-smart-100 dark:hover:bg-smart-900/30 border border-dark-200 dark:border-dark-700 transition-colors truncate"
                >
                  {res.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. COORDONNÉES GÉOGRAPHIQUES (auto-remplies, mais toujours modifiables à la main) */}
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
        <p className="text-xs text-dark-400 -mt-2">
          💡 Tu peux ajuster ces valeurs manuellement si la recherche automatique n'est pas parfaitement précise.
        </p>

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