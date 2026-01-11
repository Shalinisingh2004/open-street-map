import { Download, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { downloadGeoJSON } from '../utils/geoJsonExport';

export const ExportPanel = () => {
  const features = useStore((state) => state.features);
  const removeFeature = useStore((state) => state.removeFeature);
  const clearFeatures = useStore((state) => state.clearFeatures);

  const handleExport = () => {
    if (features.length === 0) {
      alert('No features to export');
      return;
    }
    downloadGeoJSON(features, `map-features-${Date.now()}.geojson`);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all features?')) {
      clearFeatures();
    }
  };

  return (
    <div className="absolute right-4 top-20 bg-white rounded-lg shadow-lg p-4 z-[1000] w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Features ({features.length})</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            disabled={features.length === 0}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors"
            title="Export GeoJSON"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={features.length === 0}
            className="px-2 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {features.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            No features drawn yet. Use the drawing tools to get started.
          </div>
        ) : (
          features.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{feature.properties.name}</div>
                <div className="text-xs text-gray-500 capitalize">{feature.properties.type}</div>
              </div>
              <button
                onClick={() => removeFeature(feature.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Delete feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
