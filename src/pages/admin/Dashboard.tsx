import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, Wrench, Users, CheckCircle, Clock } from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import NiveauBar from '../../components/NiveauBar';
import Loader from '../../components/Loader';
import { Poubelle, Intervention, Equipe } from '../../types';
import * as poubelleApi from '../../api/poubelles';
import * as interventionApi from '../../api/interventions';
import * as equipeApi from '../../api/equipes';
import { formatDate } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#64748b'];

export default function AdminDashboard() {
  const [poubelles, setPoubelles] = useState<Poubelle[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, i, e] = await Promise.all([
          poubelleApi.getAll(),
          interventionApi.getAll(),
          equipeApi.getAll(),
        ]);
        setPoubelles(p);
        setInterventions(i);
        setEquipes(e);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  const pleines = poubelles.filter((p) => p.statut === 'pleine').length;
  const enPanne = poubelles.filter((p) => p.statut === 'panne').length;
  const enCours = interventions.filter((i) => i.statut === 'en cours').length;
  const terminees = interventions.filter((i) => i.statut === 'terminée').length;

  const statusData = [
    { name: 'Vide', value: poubelles.filter((p) => p.statut === 'vide').length },
    { name: 'En cours', value: poubelles.filter((p) => p.statut === 'en cours').length },
    { name: 'Pleine', value: pleines },
    { name: 'Panne', value: enPanne },
  ];

  const niveauData = [
    { name: '0-25%', count: poubelles.filter((p) => p.niveau < 25).length },
    { name: '25-50%', count: poubelles.filter((p) => p.niveau >= 25 && p.niveau < 50).length },
    { name: '50-75%', count: poubelles.filter((p) => p.niveau >= 50 && p.niveau < 75).length },
    { name: '75-100%', count: poubelles.filter((p) => p.niveau >= 75).length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Vue d'ensemble du système</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Poubelles" value={poubelles.length} icon={Trash2} color="bg-smart-500" index={0} />
        <StatCard title="Poubelles pleines" value={pleines} icon={AlertTriangle} color="bg-red-500" index={1} />
        <StatCard title="Interventions actives" value={enCours} icon={Wrench} color="bg-amber-500" index={2} />
        <StatCard title="Équipes" value={equipes.length} icon={Users} color="bg-blue-500" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="section-title mb-4">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="section-title mb-4">Niveaux de remplissage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={niveauData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="section-title mb-4">Poubelles critiques</h3>
          <div className="space-y-3">
            {poubelles
              .filter((p) => p.niveau >= 70)
              .slice(0, 5)
              .map((p) => (
                <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{p.nom}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">RFID: {p.rfidUid}</p>
                  </div>
                  <div className="w-32">
                    <NiveauBar niveau={p.niveau} />
                  </div>
                  <StatusBadge status={p.statut} />
                </div>
              ))}
            {poubelles.filter((p) => p.niveau >= 70).length === 0 && (
              <p className="text-sm text-dark-500 dark:text-dark-400 text-center py-4">Aucune poubelle critique</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="section-title mb-4">Interventions récentes</h3>
          <div className="space-y-3">
            {interventions.slice(0, 5).map((i) => (
              <div key={i._id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <div className={`p-2 rounded-lg ${i.statut === 'terminée' ? 'bg-smart-100 dark:bg-smart-900/30' : i.statut === 'en cours' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-dark-100 dark:bg-dark-700'}`}>
                  {i.statut === 'terminée' ? <CheckCircle className="w-4 h-4 text-smart-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{i.description}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{formatDate(i.createdAt)}</p>
                </div>
                <StatusBadge status={i.statut} />
              </div>
            ))}
            {interventions.length === 0 && (
              <p className="text-sm text-dark-500 dark:text-dark-400 text-center py-4">Aucune intervention</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
