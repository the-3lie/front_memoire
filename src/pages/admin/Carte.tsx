import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import Loader from '../../components/Loader';
import NiveauBar from '../../components/NiveauBar';
import StatusBadge from '../../components/StatusBadge';
import { Poubelle } from '../../types';
import * as poubelleApi from '../../api/poubelles';

// 🌟 CRITIQUE : Importation obligatoire du CSS de Leaflet pour éviter la page blanche ou les tuiles brisées
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet par défaut qui buggent souvent avec Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Composant de recentrage dynamique
function ChangeMapCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, map, zoom]);
  return null;
}

const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:50%;background:white;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const getStatusMarkerColor = (statut: string, niveau: number): string => {
  if (statut === 'panne') return '#475569';
  if (niveau >= 80 || statut === 'pleine') return '#ef4444';
  if (niveau >= 20 || statut === 'moyen') return '#f59e0b';
  return '#22c55e';
};

export default function AdminCarte() {
  const [poubelles, setPoubelles] = useState<Poubelle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Centre par défaut sur Abidjan
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.3484, -4.0195]);
  const [mapZoom, setMapZoom] = useState(13);

  const chargerPoubelles = async () => {
    try {
      const data = await poubelleApi.getAll();
      const listeValide = Array.isArray(data) ? data : [];
      setPoubelles(listeValide);
      
      if (listeValide.length > 0) {
        setMapCenter([listeValide[0].latitude, listeValide[0].longitude]);
        setMapZoom(14);
      }
    } catch (err) {
      console.error("Erreur de chargement de la carte :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerPoubelles();
  }, []);

  const handleFocusPoubelle = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(16);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Carte Interactive SmartTrash</h1>
          <p className="text-dark-500 mt-1">{poubelles.length} poubelles configurées</p>
        </div>
        
        <div className="flex gap-3 flex-wrap p-2 bg-slate-100 dark:bg-dark-900/40 rounded-xl">
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vide</div>
          <div className="flex items-center gap-1 text-xs font-medium text-amber-600"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moyen</div>
          <div className="flex items-center gap-1 text-xs font-medium text-red-600"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Pleine</div>
          <div className="flex items-center gap-1 text-xs font-medium text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Panne</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Barre latérale des boutons dynamiques */}
        <div className="lg:col-span-1 space-y-2 max-h-[550px] overflow-y-auto pr-1">
          <p className="text-xs font-bold uppercase text-dark-400 tracking-wider">Localiser sur la carte :</p>
          {poubelles.map((p) => (
            <button
              key={p.id || p._id}
              onClick={() => handleFocusPoubelle(p.latitude, p.longitude)}
              className="w-full text-left bg-white dark:bg-dark-800 p-3 rounded-xl border border-slate-200 dark:border-dark-700 hover:border-smart-500 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="truncate pr-2">
                <h4 className="font-semibold text-xs truncate dark:text-dark-100 group-hover:text-smart-500">{p.nom}</h4>
                <p className="text-[10px] text-dark-400 font-mono">UID: {p.rfid_uid || p.rfidUid}</p>
              </div>
              <Navigation className="w-3.5 h-3.5 text-smart-500 transform rotate-45 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* 🗺️ Conteneur de la carte - Hauteur fixe stricte en inline-style pour parer à la page blanche */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="lg:col-span-3 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-dark-700"
          style={{ height: '550px', position: 'relative' }}
        >
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <ChangeMapCenter center={mapCenter} zoom={mapZoom} />

            {/* 🌟 Optionnel : Tuiles OpenStreetMap configurées pour privilégier la langue française via le sous-domaine openstreetmap.fr */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
            />
            
            {poubelles.map((p) => (
              <Marker 
                key={p.id || p._id} 
                position={[p.latitude, p.longitude]} 
                icon={createIcon(getStatusMarkerColor(p.statut, p.niveau))}
              >
                <Popup>
                  <div className="p-1 min-w-[180px] text-slate-800">
                    <h3 className="font-bold text-sm border-b pb-1 mb-1.5">{p.nom}</h3>
                    <p className="text-[11px] text-slate-500">RFID: <span className="font-mono bg-slate-100 px-1 rounded">{p.rfid_uid || p.rfidUid}</span></p>
                    <div className="my-2">
                      <NiveauBar niveau={p.niveau} />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">Statut:</span>
                      <StatusBadge status={p.statut} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

      </div>
    </div>
  );
}