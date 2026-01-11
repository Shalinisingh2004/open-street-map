import { create } from 'zustand';
import { AppState, AppFeature, DrawMode } from './types';

export const useStore = create<AppState>((set, get) => ({
  features: [],
  drawMode: null,
  shapeConfig: {
    circle: 10,
    rectangle: 10,
    polygon: 10,
    linestring: 15,
  },

  setDrawMode: (mode: DrawMode) => set({ drawMode: mode }),

  addFeature: (feature: AppFeature) => set((state) => ({
    features: [...state.features, feature]
  })),

  removeFeature: (id: string) => set((state) => ({
    features: state.features.filter(f => f.id !== id)
  })),

  clearFeatures: () => set({ features: [] }),

  getFeatureCountByType: (type: DrawMode) => {
    if (!type) return 0;
    return get().features.filter(f => f.properties.type === type).length;
  },
}));
