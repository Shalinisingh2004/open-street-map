<<<<<<< HEAD
# OpenStreetMap Feature Editor

A production-ready web application for drawing and managing geometrical features on OpenStreetMap with intelligent spatial constraint handling.

## Features

- **Interactive Map Rendering**: Smooth OpenStreetMap tile rendering with zoom and pan capabilities
- **Multiple Drawing Tools**: Support for Circle, Rectangle, Polygon, and Line String
- **Spatial Constraints**: Automatic overlap detection and trimming for polygonal features
- **GeoJSON Export**: Export all drawn features in standard GeoJSON format
- **Dynamic Configuration**: Configurable limits for each shape type
- **Real-time Validation**: Instant feedback on drawing constraints and shape limits

## Live Demo

[View Live Application](#) *(Add your deployed URL here)*

## Tech Stack

- **React 18** with TypeScript for type-safe development
- **Leaflet** with React-Leaflet for map rendering
- **Turf.js** for advanced spatial operations
- **Zustand** for lightweight state management
- **TailwindCSS** for modern, responsive styling
- **Vite** for fast development and optimized builds

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## How to Use

### Drawing Features

1. **Select a Tool**: Click on any tool in the left sidebar (Circle, Rectangle, Polygon, or Line String)
2. **Draw on Map**:
   - **Circle**: Click to set center, click again to set radius
   - **Rectangle**: Click to set first corner, click again for opposite corner
   - **Polygon**: Click to add points, press **Enter** to complete
   - **Line String**: Click to add points, press **Enter** to complete
3. **Cancel Drawing**: Press **Escape** to cancel current drawing operation

### Managing Features

- View all drawn features in the right panel
- Delete individual features using the trash icon
- Clear all features using the "Clear All" button
- Export features as GeoJSON using the "Export" button

### Shape Limits

Default maximum shapes per type (configurable in `src/store.ts`):
- Circles: 10
- Rectangles: 10
- Polygons: 10
- Line Strings: 15

## Polygon Overlap Logic

### Overview

The application implements intelligent spatial constraint handling to prevent overlapping polygonal features (Circle, Rectangle, and Polygon) while allowing Line Strings to freely cross any features.

### Constraint Rules

1. **Polygonal Features** (Circle, Rectangle, Polygon):
   - Must not overlap with existing polygonal features
   - Overlaps are automatically trimmed to maintain non-overlapping state
   - If a polygon is fully enclosed by another, the operation is blocked

2. **Line Strings**:
   - Can freely overlap with any feature type
   - No spatial constraints applied

### Implementation Details

#### Detection Algorithm

The overlap detection system (`src/utils/spatialOperations.ts`) uses Turf.js spatial operations:

```typescript
// 1. Intersection Check
const intersection = turf.intersect(newPolygon, existingPolygon);

// 2. Area Comparison for Full Enclosure
const newArea = turf.area(newPolygon);
const intersectionArea = turf.area(intersection);
const isFullyEnclosed = Math.abs(newArea - intersectionArea) < 0.01;

// 3. Boolean Within Check
const withinCheck = turf.booleanWithin(newPolygon, existingPolygon);
```

#### Auto-Trimming Process

When overlap is detected but not full enclosure:

1. **Calculate Difference**: Use `turf.difference()` to subtract overlapping areas
2. **Iterative Trimming**: Process all overlapping features sequentially
3. **Validation**: Ensure the resulting polygon has sufficient area (minimum 1 m²)
4. **Apply**: Add the trimmed polygon to the map

```typescript
const trimmedFeature = overlappingFeatures.reduce((current, existing) => {
  return turf.difference(current, existing);
}, newFeature);
```

#### Edge Cases Handled

- **Full Enclosure**: Blocks operation with error message
- **Complete Overlap**: Removes feature if nothing remains after trimming
- **Partial Overlap**: Automatically trims to non-overlapping geometry
- **Multiple Overlaps**: Handles sequential trimming of multiple features
- **Invalid Geometries**: Catches and handles spatial operation errors

### Visual Feedback

- **Red Fill**: Polygonal features (Circle, Rectangle, Polygon)
- **Blue Stroke**: Line Strings
- **Error Messages**: Temporary notifications for constraint violations
- **Real-time Preview**: Visual feedback during drawing operations

## Project Structure

```
src/
├── components/
│   ├── MapView.tsx           # Main map container with OSM tiles
│   ├── DrawingManager.tsx    # Drawing interaction handler
│   ├── DrawToolbar.tsx       # Drawing tool selection sidebar
│   └── ExportPanel.tsx       # Feature list and export controls
├── utils/
│   ├── spatialOperations.ts  # Overlap detection and trimming logic
│   └── geoJsonExport.ts      # GeoJSON export functionality
├── types.ts                  # TypeScript type definitions
├── store.ts                  # Zustand state management
├── App.tsx                   # Main application component
└── main.tsx                  # Application entry point
```

## Configuration

### Adjusting Shape Limits

Edit `src/store.ts` to modify maximum shapes per type:

```typescript
shapeConfig: {
  circle: 10,        // Maximum circles
  rectangle: 10,     // Maximum rectangles
  polygon: 10,       // Maximum polygons
  linestring: 15,    // Maximum line strings
}
```

### Customizing Styles

Feature styles can be customized in `src/components/MapView.tsx`:

```typescript
style={{
  color: feature.properties.type === 'linestring' ? '#3b82f6' : '#ef4444',
  weight: feature.properties.type === 'linestring' ? 3 : 2,
  fillOpacity: feature.properties.type === 'linestring' ? 0 : 0.2,
}}
```

## Sample GeoJSON Export

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "polygon-1704901234567",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      },
      "properties": {
        "type": "polygon",
        "name": "Polygon 1",
        "createdAt": "2024-01-10T12:00:00.000Z"
      }
    },
    {
      "type": "Feature",
      "id": "linestring-1704901234568",
      "geometry": {
        "type": "LineString",
        "coordinates": [[0, 0], [1, 1], [2, 0]]
      },
      "properties": {
        "type": "linestring",
        "name": "LineString 1",
        "createdAt": "2024-01-10T12:01:00.000Z"
      }
    }
  ]
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Considerations

- Efficient spatial operations using Turf.js
- Optimized rendering with React-Leaflet
- Lightweight state management with Zustand
- Lazy rendering for large feature collections

## Known Limitations

- Minimum polygon area threshold: 1 m²
- Circle approximation: 64-sided polygon
- Maximum recommended features: 100 (for optimal performance)

## Future Enhancements

- [ ] Undo/Redo functionality
- [ ] Feature editing after creation
- [ ] Multiple map layer support
- [ ] Import GeoJSON files
- [ ] Custom styling per feature
- [ ] Feature search and filtering

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
=======
# open-street-map
>>>>>>> e30a80fd0ef7e7777c0199628548b5733a683147
