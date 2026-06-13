import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import NiveauBar from '../../components/NiveauBar';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { Intervention, Poubelle } from '../../types';
import * as interventionApi from '../../api/interventions';
import * as poubelleApi from '../../api/poubelles';

export default function EquipeDashboard() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [poubelles, setPoubelles] = useState<Poubelle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ints, pbs] = await Promise.all([
          interventionApi.getAll(),
          poubelleApi.getAll(),
        ]);
        setInterventions(ints);
        setPoubelles(pbs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  const myInterventions = interventions.filter((i) => {
    const eqId = typeof i.equipe === 'string' ? i.equipe : (i.equipe as any)?._id;
    return eqId === user?._id;
  });

  const enAttente = myInterventions.filter((i) => i.statut === 'en attente').length;
  const enCours = myInterventions.filter((i) => i.statut === 'en cours').length;
  const terminees = myInterventions.filter((i) => i.statut === 'terminée').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard Équipe</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Bienvenue, {user?.nom}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Mes interventions" value={myInterventions.length} icon={Wrench} color="bg-amber-500" index={0} />
        <StatCard title="En attente" value={enAttente} icon={Clock} color="bg-blue-500" index={1} />
        <StatCard title="En cours" value={enCours} icon={Wrench} color="bg-amber-500" index={2} />
        <StatCard title="Terminées" value={terminees} icon={CheckCircle} color="bg-smart-500" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="section-title mb-4">Interventions actives</h3>
          <div className="space-y-3">
            {myInterventions.filter((i) => i.statut !== 'terminée').slice(0, 5).map((intv) => (
              <div key={intv._id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <div className={`p-2 rounded-lg ${intv.statut === 'en cours' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  <Wrench className={`w-4 h-4 ${intv.statut === 'en cours' ? 'text-amber-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{intv.description}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">Poubelle: {typeof intv.poubelle === 'string' ? intv.poubelle : (intv.poubelle as any)?.nom}</p>
                </div>
                <StatusBadge status={intv.statut} />
              </div>
            ))}
            {myInterventions.filter((i) => i.statut !== 'terminée').length === 0 && (
              <p className="text-sm text-dark-500 text-center py-4">Aucune intervention active</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="section-title mb-4">Poubelles critiques</h3>
          <div className="space-y-3">
            {poubelles.filter((p) => p.niveau >= 70).slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{p.nom}</p>
                  <div className="w-24 mt-1"><NiveauBar niveau={p.niveau} /></div>
                </div>
                <StatusBadge status={p.statut} />
              </div>
            ))}
            {poubelles.filter((p) => p.niveau >= 70).length === 0 && (
              <p className="text-sm text-dark-500 text-center py-4">Aucune poubelle critique</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
