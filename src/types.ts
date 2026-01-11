import { Feature, Geometry } from 'geojson';

export type DrawMode = 'circle' | 'rectangle' | 'polygon' | 'linestring' | null;

export interface AppFeature extends Feature {
  id: string;
  geometry: Geometry;
  properties: {
    type: DrawMode;
    name: string;
    createdAt: string;
  };
}

export interface ShapeConfig {
  circle: number;
  rectangle: number;
  polygon: number;
  linestring: number;
}

export interface AppState {
  features: AppFeature[];
  drawMode: DrawMode;
  shapeConfig: ShapeConfig;
  setDrawMode: (mode: DrawMode) => void;
  addFeature: (feature: AppFeature) => void;
  removeFeature: (id: string) => void;
  clearFeatures: () => void;
  getFeatureCountByType: (type: DrawMode) => number;
}
