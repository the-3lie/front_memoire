import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Panne, Poubelle } from '../../types';
import * as panneApi from '../../api/pannes';
import * as poubelleApi from '../../api/poubelles';
import { formatDate } from '../../utils/helpers';

export default function AdminPannes() {
  const [pannes, setPannes] = useState<Panne[]>([]);
  const [poubelles, setPoubelles] = useState<Poubelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ poubelle: '', description: '' });

  const fetchData = async () => {
    try {
      const [pns, pbs] = await Promise.all([panneApi.getAll(), poubelleApi.getAll()]);
      setPannes(Array.isArray(pns) ? pns : []);
      setPoubelles(Array.isArray(pbs) ? pbs : []);
    } catch (err) {
      console.error("Erreur d'acquisition des données :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.poubelle || !form.description.trim()) return;

    try {
      // Aligné sur ton contrôleur : poubelle_id et description
      await panneApi.create({ 
        poubelle_id: form.poubelle, 
        description: form.description.trim()
      } as any);
      
      setShowModal(false);
      setForm({ poubelle: '', description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // 🌟 SIMPLIFIÉ : Exploite directement le formatage de ton nouveau contrôleur backend !
  const getName = (item: any) => {
    if (!item) return 'Poubelle inconnue';
    return item.nom_poubelle || item.poubelle?.nom || item.nom || 'Poubelle connectée';
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Pannes (Administration)</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            {pannes.length} panne{pannes.length > 1 ? 's' : ''} répertoriée{pannes.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Signaler une panne
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <DataTable
          columns={[
            { key: 'poubelle', label: 'Poubelle', render: (item) => <span className="font-medium">{getName(item)}</span> },
            { key: 'description', label: 'Description', render: (item) => <span className="text-sm">{(item as Panne).description}</span> },
            { key: 'statut', label: 'Statut', render: (item) => <StatusBadge status={(item as Panne).statut} /> },
            { key: 'createdAt', label: 'Date', render: (item) => <span className="text-sm text-dark-500">{formatDate((item as any).createdAt || (item as any).created_at)}</span> },
          ]}
          data={pannes as unknown as Record<string, unknown>[]}
          searchPlaceholder="Rechercher une panne..."
          searchKeys={['description', 'nom_poubelle']}
        />
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Signaler une panne">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Poubelle</label>
            <select value={form.poubelle} onChange={(e) => setForm({ ...form, poubelle: e.target.value })} className="input-field w-full" required>
              <option value="">Sélectionner une poubelle</option>
              {poubelles.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.nom} ({p.rfid_uid || p.rfidUid || 'Pas de badge'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field w-full" rows={3} required placeholder="Description de la panne..." />
          </div>
          <button type="submit" className="btn-primary w-full">Envoyer le rapport</button>
        </form>
      </Modal>
    </div>
  );
}