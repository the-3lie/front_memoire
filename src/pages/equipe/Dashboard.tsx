import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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
        console.error("Erreur lors de la récupération des données du dashboard :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  // 🛡️ Récupération de l'ID de l'utilisateur connecté (MySQL id ou MongoDB _id)
  const currentUserId = user?.id || user?._id;

  // 🔍 Filtrage ultra-robuste des interventions assignées
  const myInterventions = interventions.filter((i) => {
    if (!i.equipe) return false;
    
    // Si l'équipe est juste une chaîne (un ID brut)
    if (typeof i.equipe === 'string' || typeof i.equipe === 'number') {
      return String(i.equipe) === String(currentUserId);
    }
    
    // Si l'équipe est un objet peuplé par le backend (comme dans ton getAllInterventions)
    const equipeObj = i.equipe as any;
    const backendEquipeId = equipeObj.id || equipeObj._id;
    
    return String(backendEquipeId) === String(currentUserId);
  });

  // 🛠️ DEBUG TEMPORAIRE (Ouvre ta console F12 pour voir ce qui est reçu)
  console.log("Mon ID Utilisateur connecté :", currentUserId);
  console.log("Toutes les interventions reçues du serveur :", interventions);
  console.log("Mes interventions filtrées :", myInterventions);

  // 🛡️ CALCUL DES COMPTEURS (En phase avec le backend MySQL)
  const enAttente = myInterventions.filter((i) => {
    const stat = String(i.statut).toLowerCase().trim();
    return stat === 'en attente' || stat === 'en_attente';
  }).length;

  const enCours = myInterventions.filter((i) => {
    const stat = String(i.statut).toLowerCase().trim();
    return stat === 'en cours' || stat === 'en_cours';
  }).length;

  const terminees = myInterventions.filter((i) => {
    const stat = String(i.statut).toLowerCase().trim();
    return stat === 'terminee' || stat === 'terminée';
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard Équipe</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Bienvenue, {user?.nom}</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Mes interventions" value={myInterventions.length} icon={Wrench} color="bg-indigo-500" index={0} />
        <StatCard title="En attente" value={enAttente} icon={Clock} color="bg-blue-500" index={1} />
        <StatCard title="En cours" value={enCours} icon={Wrench} color="bg-amber-500" index={2} />
        <StatCard title="Terminées" value={terminees} icon={CheckCircle} color="bg-smart-500" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Interventions Actives */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="section-title mb-4">Interventions actives</h3>
          <div className="space-y-3">
            {myInterventions
              .filter((i) => {
                const stat = String(i.statut).toLowerCase().trim();
                return stat !== 'terminee' && stat !== 'terminée';
              })
              .slice(0, 5)
              .map((intv) => {
                const idIntervention = intv.id || intv._id;
                const statNormalise = String(intv.statut).toLowerCase().trim();
                const isEnCours = statNormalise === 'en cours' || statNormalise === 'en_cours';

                return (
                  <div key={idIntervention} className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                    <div className={`p-2 rounded-lg ${isEnCours ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      <Wrench className={`w-4 h-4 ${isEnCours ? 'text-amber-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{intv.description || 'Collecte standard'}</p>
                      <p className="text-xs text-dark-500 dark:text-dark-400">
                        Poubelle: {typeof intv.poubelle === 'string' ? intv.poubelle : (intv.poubelle as any)?.nom || 'Poubelle connectée'}
                      </p>
                    </div>
                    <StatusBadge status={intv.statut} />
                  </div>
                );
              })}
            
            {myInterventions.filter((i) => {
              const stat = String(i.statut).toLowerCase().trim();
              return stat !== 'terminee' && stat !== 'terminée';
            }).length === 0 && (
              <p className="text-sm text-dark-500 text-center py-4">Aucune intervention active</p>
            )}
          </div>
        </motion.div>

        {/* Section Poubelles Critiques */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="section-title mb-4">Poubelles critiques</h3>
          <div className="space-y-3">
            {poubelles
              .filter((p) => p.niveau >= 70)
              .slice(0, 5)
              .map((p) => {
                const idPoubelle = p.id || p._id;
                return (
                  <div key={idPoubelle} className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{p.nom}</p>
                      <div className="w-24 mt-1"><NiveauBar niveau={p.niveau} /></div>
                    </div>
                    <StatusBadge status={p.statut} />
                  </div>
                );
              })}
            
            {poubelles.filter((p) => p.niveau >= 70).length === 0 && (
              <p className="text-sm text-dark-500 text-center py-4">Aucune poubelle critique</p>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}