import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Intervention, Poubelle, Equipe } from '../../types';
import * as interventionApi from '../../api/interventions';
import * as poubelleApi from '../../api/poubelles';
import * as equipeApi from '../../api/equipes';
import { formatDate } from '../../utils/helpers';

export default function AdminInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [poubelles, setPoubelles] = useState<Poubelle[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]); // Représente tes utilisateurs au rôle 'equipe'
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ poubelle: '', equipe: '', description: '', statut: 'en attente' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [ints, pbs, eqs] = await Promise.all([
        interventionApi.getAll(),
        poubelleApi.getAll(),
        equipeApi.getAll(),
      ]);
      setInterventions(ints);
      setPoubelles(pbs);
      setEquipes(eqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const donneesIntervention = {
        poubelle_id: form.poubelle,
        equipe_id: form.equipe, // Envoie l'ID de l'utilisateur d'équipe
        description: form.description
      };

      await interventionApi.create(donneesIntervention);
      setShowModal(false);
      setForm({ poubelle: '', equipe: '', description: '', statut: 'en attente' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la création");
    }
  };

  const updateStatut = async (id: string, statut: string) => {
    try {
      await interventionApi.update(id, { statut });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette intervention ?')) return;
    try {
      await interventionApi.remove(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Interventions</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{interventions.length} interventions</p>
        </div>
        <button onClick={() => { setError(''); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nouvelle intervention
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <DataTable
          columns={[
            { key: 'description', label: 'Description', render: (item: any) => <span className="font-medium">{item.description}</span> },
            // 🌟 CORRECTION DU CRASH OBJECT : On va chercher la propriété textuelle (.nom)
            { key: 'poubelle', label: 'Poubelle', render: (item: any) => <span className="text-sm">{item.poubelle?.nom || 'Sans nom'}</span> },
            // 🌟 AFFICHAGE DU COMPTE INTERVENANT : S'adapte au nom de l'utilisateur
            { key: 'equipe', label: 'Équipe / Intervenant', render: (item: any) => <span className="text-sm">{item.equipe?.nom || 'Non assigné'}</span> },
            { key: 'statut', label: 'Statut', render: (item: any) => <StatusBadge status={item.statut} /> },
            { key: 'createdAt', label: 'Date', render: (item: any) => <span className="text-sm text-dark-500">{formatDate(item.createdAt || item.date_assignation)}</span> },
          ]}
          data={interventions as unknown as Record<string, unknown>[]}
          searchPlaceholder="Rechercher une intervention..."
          searchKeys={['description']}
          actions={(item: any) => {
            const id = item.id || item._id;
            return (
              <div className="flex items-center gap-1">
                {item.statut !== 'terminee' && item.statut !== 'terminée' && (
                  <button onClick={() => updateStatut(id, 'terminee')} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700" title="Terminer">
                    <CheckCircle className="w-4 h-4 text-smart-500" />
                  </button>
                )}
                {(item.statut === 'en attente' || item.statut === 'en_attente') && (
                  <button onClick={() => updateStatut(id, 'en cours')} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700" title="Démarrer">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </button>
                )}
                <button onClick={() => handleDelete(id)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700">
                  <XCircle className="w-4 h-4 text-red-500" />
                </button>
              </div>
            );
          }}
        />
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle intervention">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Sélecteur Poubelle */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Poubelle</label>
            <select value={form.poubelle} onChange={(e) => setForm({ ...form, poubelle: e.target.value })} className="input-field" required>
              <option value="">Sélectionner une poubelle</option>
              {poubelles.map((p: any) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.nom || 'Poubelle'} ({p.rfid_uid || p.rfidUid || 'Sans RFID'})
                </option>
              ))}
            </select>
          </div>

          {/* Sélecteur Intervenant (Table Users) */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Attribuer à un intervenant</label>
            <select value={form.equipe} onChange={(e) => setForm({ ...form, equipe: e.target.value })} className="input-field" required>
              <option value="">Sélectionner un agent de terrain</option>
              {equipes.map((eq: any) => (
                <option key={eq.id || eq._id} value={eq.id || eq._id}>
                  {eq.nom} {eq.localite ? `(Zone: ${eq.localite})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} required placeholder="Description de l'intervention..." />
          </div>
          <button type="submit" className="btn-primary w-full">Créer l'intervention</button>
        </form>
      </Modal>
    </div>
  );
}