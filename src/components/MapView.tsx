// import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
// import { useStore } from '../store';
// import { DrawingManager } from './DrawingManager';
// import 'leaflet/dist/leaflet.css';

// export const MapView = () => {
//   const features = useStore((state) => state.features);

//   return (
//     <MapContainer
//       center={[20, 0]}
//       zoom={2}
//       style={{ height: '100%', width: '100%' }}
//       className="z-0"
//     >
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       <DrawingManager />

//       {features.map((feature) => (
//         <GeoJSON
//           key={feature.id}
//           data={feature}
//           style={{
//             color: feature.properties.type === 'linestring' ? '#3b82f6' : '#ef4444',
//             weight: feature.properties.type === 'linestring' ? 3 : 2,
//             fillOpacity: feature.properties.type === 'linestring' ? 0 : 0.2,
//           }}
//         />
//       ))}
//     </MapContainer>
//   );
// };


import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useStore } from '../store';
import { DrawingManager } from './DrawingManager';
import SearchBox from './SearchBox';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

export const MapView = () => {
  const features = useStore((state) => state.features);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      {/* OpenStreetMap Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
          OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔍 Search Control */}
      <SearchBox />

      {/* Drawing Controls */}
      <DrawingManager />

      {/* Render Features */}
      {features.map((feature) => (
        <GeoJSON
          key={feature.id}
          data={feature}
          style={{
            color:
              feature.properties.type === 'linestring'
                ? '#3b82f6'
                : '#ef4444',
            weight:
              feature.properties.type === 'linestring'
                ? 3
                : 2,
            fillOpacity:
              feature.properties.type === 'linestring'
                ? 0
                : 0.2,
          }}
        />
      ))}
    </MapContainer>
  );
};
