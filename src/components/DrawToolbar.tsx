import { Circle, Square, Pentagon, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { DrawMode } from '../types';

interface ToolButton {
  mode: DrawMode;
  icon: React.ReactNode;
  label: string;
}

export const DrawToolbar = () => {
  const drawMode = useStore((state) => state.drawMode);
  const setDrawMode = useStore((state) => state.setDrawMode);
  const getFeatureCountByType = useStore((state) => state.getFeatureCountByType);
  const shapeConfig = useStore((state) => state.shapeConfig);

  const tools: ToolButton[] = [
    { mode: 'circle', icon: <Circle className="w-5 h-5" />, label: 'Circle' },
    { mode: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Rectangle' },
    { mode: 'polygon', icon: <Pentagon className="w-5 h-5" />, label: 'Polygon' },
    { mode: 'linestring', icon: <TrendingUp className="w-5 h-5" />, label: 'Line String' },
  ];

  const handleToolClick = (mode: DrawMode) => {
    if (drawMode === mode) {
      setDrawMode(null);
    } else {
      setDrawMode(mode);
    }
  };

  const getCount = (mode: DrawMode): string => {
    if (!mode) return '';
    const count = getFeatureCountByType(mode);
    const max = shapeConfig[mode];
    return `${count}/${max}`;
  };

  return (
    <div className="absolute left-4 top-20 bg-white rounded-lg shadow-lg p-3 z-[1000] space-y-2">
      <div className="text-sm font-semibold text-gray-700 mb-3">Drawing Tools</div>
      {tools.map((tool) => (
        <button
          key={tool.mode}
          onClick={() => handleToolClick(tool.mode)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            drawMode === tool.mode
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={`Draw ${tool.label} (${getCount(tool.mode)})`}
        >
          {tool.icon}
          <div className="flex-1 text-left text-sm">{tool.label}</div>
          <div className="text-xs opacity-75">{getCount(tool.mode)}</div>
        </button>
      ))}
      {drawMode && (
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
          {drawMode === 'polygon' && 'Click to add points, press Enter to finish'}
          {drawMode === 'linestring' && 'Click to add points, press Enter to finish'}
          {drawMode === 'rectangle' && 'Click to start, click again to finish'}
          {drawMode === 'circle' && 'Click center, click again to set radius'}
        </div>
      )}
    </div>
  );
};
