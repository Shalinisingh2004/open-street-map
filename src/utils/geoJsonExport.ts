import { FeatureCollection } from 'geojson';
import { AppFeature } from '../types';

export const exportToGeoJSON = (features: AppFeature[]): string => {
  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features.map(feature => ({
      type: 'Feature',
      id: feature.id,
      geometry: feature.geometry,
      properties: {
        type: feature.properties.type,
        name: feature.properties.name,
        createdAt: feature.properties.createdAt
      }
    }))
  };

  return JSON.stringify(featureCollection, null, 2);
};

export const downloadGeoJSON = (features: AppFeature[], filename: string = 'features.geojson'): void => {
  const geoJson = exportToGeoJSON(features);
  const blob = new Blob([geoJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
