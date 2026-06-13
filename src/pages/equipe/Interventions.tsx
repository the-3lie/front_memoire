import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Play } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { Intervention } from '../../types';
import * as interventionApi from '../../api/interventions';
import { formatDate } from '../../utils/helpers';

export default function EquipeInterventions() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterventions = async () => {
    try {
      const data = await interventionApi.getAll();
      console.log("Données reçues de l'API interventions :", data);
      console.log("Utilisateur connecté (AuthContext) :", user);
      
      setInterventions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchInterventions(); 
  }, [user]);

  const myInterventions = useMemo(() => {
    return interventions.filter((i: any) => {
      if (!i) return false;
      const assignedId = i.equipe?.id || i.equipe?._id || i.equipe_id || (typeof i.equipe !== 'object' ? i.equipe : null);
      const currentUserId = user?.id || (user as any)?._id;

      if (!assignedId || !currentUserId) return false;
      return String(assignedId) === String(currentUserId);
    });
  }, [interventions, user]);

  const updateStatut = async (id: string | number, statut: string) => {
    try {
      await interventionApi.update(id, { statut });
      await fetchInterventions(); 
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mes Interventions</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          {myInterventions.length} intervention{myInterventions.length > 1 ? 's' : ''} assignée{myInterventions.length > 1 ? 's' : ''}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <DataTable
          columns={[
            { 
              key: 'description', 
              label: 'Description', 
              render: (item: any) => <span className="font-medium">{item?.description || 'Collecte standard'}</span> 
            },
            { 
              key: 'poubelle', 
              label: 'Poubelle', 
              render: (item: any) => <span className="text-sm">{item?.poubelle?.nom || item?.nom_poubelle || 'Poubelle connectée'}</span> 
            },
            { 
              key: 'statut', 
              label: 'Statut', 
              render: (item: any) => <StatusBadge status={item?.statut || 'en attente'} /> 
            },
            { 
              key: 'createdAt', 
              label: 'Date', 
              render: (item: any) => <span className="text-sm text-dark-500">{formatDate(item?.createdAt || item?.date_assignation)}</span> 
            },
          ]}
          data={myInterventions as unknown as Record<string, unknown>[]}
          searchPlaceholder="Rechercher une intervention..."
          searchKeys={['description']}
          actions={(item: any) => {
            const id = item?.id || item?._id;
            const currentStatut = String(item?.statut).toLowerCase().trim();
            
            return (
              <div className="flex items-center gap-2">
                
                {/* 📥 ÉTAPE 1 : Si l'intervention est "En attente" */}
                {(currentStatut === 'en attente' || currentStatut === 'en_attente') && (
                  <button 
                    onClick={() => updateStatut(id, 'en cours')} 
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 transition-all active:scale-95"
                    title="Démarrer l'intervention"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Démarrer</span>
                  </button>
                )}
                
                {/* ⚙️ ÉTAPE 2 : Si l'intervention est "En cours" */}
                {currentStatut === 'en cours' && (
                  <button 
                    onClick={() => updateStatut(id, 'terminee')} 
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-all active:scale-95"
                    title="Marquer comme terminée"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Terminer</span>
                  </button>
                )}

                {/* ✅ ÉTAPE 3 : Si l'intervention est "Terminée" */}
                {currentStatut === 'terminee' && (
                  <span className="text-xs text-dark-400 dark:text-dark-500 italic px-2 font-medium">
                    Mission accomplie
                  </span>
                )}

              </div>
            );
          }}
        />
      </motion.div>
    </div>
  );
}