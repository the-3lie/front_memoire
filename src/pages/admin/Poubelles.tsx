import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Edit3, Eye, MapPin } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import NiveauBar from '../../components/NiveauBar';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Poubelle } from '../../types';
import * as poubelleApi from '../../api/poubelles';
import { formatDate } from '../../utils/helpers';

export default function AdminPoubelles() {
  const [poubelles, setPoubelles] = useState<Poubelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<Poubelle | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ nom: '', rfidUid: '', latitude: '', longitude: '' });
  const [error, setError] = useState(''); // 🎉 Ajout du state d'erreur manquant

  const fetchPoubelles = async () => {
    try {
      const data = await poubelleApi.getAll();
      setPoubelles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPoubelles(); }, []);

  const openCreate = () => {
    setIsEdit(false);
    setError('');
    setForm({ nom: '', rfidUid: '', latitude: '', longitude: '' });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setIsEdit(true);
    setError('');
    setSelected(p);
    setForm({ 
      nom: p.nom || '', 
      rfidUid: p.rfid_uid || p.rfidUid || '', 
      latitude: String(p.latitude), 
      longitude: String(p.longitude) 
    });
    setShowModal(true);
  };

  const openDetail = (p: Poubelle) => {
    setSelected(p);
    setShowDetail(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mappage des clés pour correspondre aux colonnes SQL attendues par MySQL
      const donneesPoubelle = {
        rfid_uid: form.rfidUid,
        nom: form.nom,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      };

      if (isEdit && selected) {
        const id = selected.id || (selected as any)._id;
        await poubelleApi.update(id, donneesPoubelle);
      } else {
        await poubelleApi.create(donneesPoubelle); 
      }
      
      setShowModal(false);
      fetchPoubelles(); // 🎉 Corrigé : utilisation de fetchPoubelles() au lieu de fetchData()
      
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement de la poubelle");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette poubelle ?')) return;
    try {
      await poubelleApi.remove(id);
      fetchPoubelles();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Gestion des Poubelles</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{poubelles.length} poubelles connectées</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Ajouter
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <DataTable
          columns={[
            { key: 'rfidUid', label: 'RFID', render: (item: any) => <span className="font-mono text-sm">{item.rfid_uid || item.rfidUid}</span> },
            { key: 'nom', label: 'Nom', render: (item: any) => <span className="font-medium">{item.nom || 'Sans nom'}</span> },
            { key: 'niveau', label: 'Niveau', render: (item: any) => <div className="w-28"><NiveauBar niveau={item.niveau || 0} /></div> },
            { key: 'statut', label: 'Statut', render: (item: any) => <StatusBadge status={item.statut || 'vide'} /> },
            { key: 'createdAt', label: 'Date', render: (item: any) => <span className="text-sm text-dark-500">{formatDate(item.createdAt || item.created_at)}</span> },
          ]}
          data={poubelles as unknown as Record<string, unknown>[]}
          searchPlaceholder="Rechercher une poubelle..."
          searchKeys={['nom', 'rfid_uid', 'rfidUid']}
          actions={(item: any) => {
            const id = item.id || item._id;
            return (
              <div className="flex items-center gap-2">
                <button onClick={() => openDetail(item as Poubelle)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"><Eye className="w-4 h-4 text-dark-500" /></button>
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"><Edit3 className="w-4 h-4 text-blue-500" /></button>
                <button onClick={() => handleDelete(id)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            );
          }}
        />
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? 'Modifier la poubelle' : 'Ajouter une poubelle'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Alerte d'erreur SQL */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nom</label>
            <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="input-field" required placeholder="Poubelle Centre-Ville" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">UID RFID</label>
            <input type="text" value={form.rfidUid} onChange={(e) => setForm({ ...form, rfidUid: e.target.value })} className="input-field font-mono" required placeholder="A1B2C3D4" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="input-field" required placeholder="5.3484" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="input-field" required placeholder="-3.9792" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">{isEdit ? 'Modifier' : 'Ajouter'}</button>
        </form>
      </Modal>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Détails de la poubelle" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <p className="text-xs text-dark-500 mb-1">RFID</p>
                <p className="font-mono font-semibold text-dark-900 dark:text-white">{(selected as any).rfid_uid || selected.rfidUid}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <p className="text-xs text-dark-500 mb-1">Nom</p>
                <p className="font-semibold text-dark-900 dark:text-white">{selected.nom}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <p className="text-xs text-dark-500 mb-1">Niveau</p>
                <div className="mt-2"><NiveauBar niveau={selected.niveau || 0} /></div>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <p className="text-xs text-dark-500 mb-1">Statut</p>
                <div className="mt-1"><StatusBadge status={selected.statut || 'vide'} size="md" /></div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <MapPin className="w-5 h-5 text-smart-500" />
              <span className="text-sm text-dark-700 dark:text-dark-300">{selected.latitude}, {selected.longitude}</span>
            </div>
            <p className="text-xs text-dark-500">Créée le {formatDate(selected.createdAt || (selected as any).created_at)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}