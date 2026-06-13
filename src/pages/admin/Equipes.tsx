import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit3, Trash2, Phone, Mail, MapPin, Key } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Equipe } from '../../types';
import * as equipeApi from '../../api/equipes';
import { formatDate } from '../../utils/helpers';

export default function AdminEquipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<Equipe | null>(null);
  
  // 🌟 Formulaire adapté : Ajout du champ password, retrait du champ membres qui n'a plus lieu d'être
  const [form, setForm] = useState({ nom: '', email: '', zone: '', telephone: '', password: '' });
  const [error, setError] = useState('');

  const fetchEquipes = async () => {
    try {
      const data = await equipeApi.getAll();
      setEquipes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEquipes(); }, []);

  const openCreate = () => {
    setIsEdit(false);
    setError('');
    setForm({ nom: '', email: '', zone: '', telephone: '', password: '' });
    setShowModal(true);
  };

  const openEdit = (e: any) => {
    setIsEdit(true);
    setError('');
    setSelected(e);
    setForm({ 
      nom: e.nom || '', 
      email: e.email || '', 
      zone: e.localite || e.zone || '', 
      telephone: e.telephone || e.telephone_chef || '',
      password: '' // On laisse vide à la modification pour des raisons de sécurité
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🌟 Payload exact mappé pour les colonnes de ta table MySQL 'users'
      const donneesIntervenant = {
        nom: form.nom,
        email: form.email,
        password: form.password, // Transmis au backend pour le hachage bcrypt
        zone: form.zone,         // Atterrira dans la colonne 'localite'
        telephone: form.telephone
      };

      if (isEdit && selected) {
        const id = selected.id || (selected as any)._id;
        await equipeApi.update(id, donneesIntervenant);
      } else {
        await equipeApi.create(donneesIntervenant); 
      }

      await fetchEquipes();
      setShowModal(false);
      setForm({ nom: '', email: '', zone: '', telephone: '', password: '' });

    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement de l'intervenant");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce compte intervenant ?')) return;
    try {
      await equipeApi.remove(id);
      fetchEquipes();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Gestion des Équipes</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{equipes.length} agents d'intervention</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Ajouter un intervenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipes.map((equipe: any, i) => (
          <motion.div
            key={equipe.id || equipe._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 dark:text-white">{equipe.nom || equipe.nom_equipe}</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full mt-0.5 inline-block">Agent de terrain</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(equipe)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700">
                  <Edit3 className="w-4 h-4 text-blue-500" />
                </button>
                <button onClick={() => handleDelete(equipe.id || equipe._id)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 border-t border-dark-100 dark:border-dark-800 pt-3">
              <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <Mail className="w-4 h-4" /> {equipe.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <Phone className="w-4 h-4" /> {equipe.telephone || equipe.telephone_chef || 'Non renseigné'}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <MapPin className="w-4 h-4" /> <span className="font-medium text-dark-800 dark:text-dark-200">Zone: {equipe.localite || equipe.zone}</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-dark-400 text-right">Inscrit le {formatDate(equipe.created_at || equipe.createdAt)}</p>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? "Modifier le profil de l'intervenant" : 'Créer un compte Équipe Terrain'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nom Complet</label>
            <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="input-field" required placeholder="Ex: GUEI Henoc" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email (Sert d'identifiant)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required placeholder="equipe.nord@smartbin.com" />
          </div>

          {/* 🌟 Le mot de passe est visible uniquement lors de la création initiale du compte */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-dark-400" /> Mot de passe de connexion
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required={!isEdit} placeholder="••••••••" minLength={6} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Zone (Localité)</label>
              <input type="text" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="input-field" required placeholder="Ex: Cocody" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Téléphone</label>
              <input type="text" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="input-field" required placeholder="+225 07 XX XX XX XX" />
            </div>
          </div>
          
          <button type="submit" className="btn-primary w-full bg-amber-500 hover:bg-amber-600 border-none">
            {isEdit ? 'Mettre à jour le profil' : 'Créer et activer le compte'}
          </button>
        </form>
      </Modal>
    </div>
  );
}