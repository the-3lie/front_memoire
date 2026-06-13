import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import * as panneApi from '../../api/pannes';
import * as poubelleApi from '../../api/poubelles';
import { formatDate } from '../../utils/helpers';

export default function EquipePannes() {
  const [pannes, setPannes] = useState<any[]>([]);
  const [poubelles, setPoubelles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ poubelle: '', description: '' });

  const fetchData = async () => {
    try {
      const [pns, pbs] = await Promise.all([panneApi.getAll(), poubelleApi.getAll()]);
      setPannes(Array.isArray(pns) ? pns : []);
      setPoubelles(Array.isArray(pbs) ? pbs : []);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.poubelle || !form.description.trim()) return;

    try {
      await panneApi.create({ 
        poubelle_id: form.poubelle, 
        description: form.description.trim() 
      } as any);

      setShowModal(false);
      setForm({ poubelle: '', description: '' });
      fetchData(); 
    } catch (err) {
      console.error("Erreur lors de l'envoi du rapport :", err);
    }
  };

  // 🌟 SIMPLIFIÉ : Utilise la même logique propre que l'Admin
  const getName = (item: any) => {
    if (!item) return 'Poubelle inconnue';
    return item.nom_poubelle || item.poubelle?.nom || item.nom || 'Poubelle connectée';
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Pannes</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Signaler et suivre les pannes terrain</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-amber-500/25">
          <Plus className="w-5 h-5" /> Signaler une panne
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <DataTable
          columns={[
            { key: 'poubelle', label: 'Poubelle', render: (item: any) => <span className="font-medium">{getName(item)}</span> },
            { key: 'description', label: 'Description', render: (item: any) => <span className="text-sm">{item?.description}</span> },
            { key: 'statut', label: 'Statut', render: (item: any) => <StatusBadge status={item?.statut || 'signalee'} /> },
            { key: 'createdAt', label: 'Date', render: (item: any) => <span className="text-sm text-dark-500">{formatDate(item?.createdAt || item?.created_at)}</span> },
          ]}
          data={pannes}
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
              {poubelles.map((p: any) => (
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
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
            Envoyer le rapport
          </button>
        </form>
      </Modal>
    </div>
  );
}