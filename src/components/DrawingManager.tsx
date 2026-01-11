import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Polygon, MultiPolygon, LineString } from 'geojson';
import { useStore } from '../store';
import { AppFeature, DrawMode } from '../types';
import {
  checkPolygonOverlap,
  trimPolygonOverlaps,
  isPolygonalFeature,
  circleToPolygon,
} from '../utils/spatialOperations';

export const DrawingManager = () => {
  const map = useMap();
  const drawMode = useStore((state) => state.drawMode);
  const features = useStore((state) => state.features);
  const addFeature = useStore((state) => state.addFeature);
  const setDrawMode = useStore((state) => state.setDrawMode);
  const getFeatureCountByType = useStore((state) => state.getFeatureCountByType);
  const shapeConfig = useStore((state) => state.shapeConfig);

  const [error, setError] = useState<string | null>(null);
  const drawingLayerRef = useRef<L.Layer | null>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<L.LatLng[]>([]);
  const tempLineRef = useRef<L.Polyline | null>(null);
  const tempCircleRef = useRef<L.Circle | null>(null);
  const startPointRef = useRef<L.LatLng | null>(null);

  useEffect(() => {
    if (!map || !drawMode) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!drawMode) return;

      if (drawMode === 'polygon') {
        handlePolygonClick(e);
      } else if (drawMode === 'linestring') {
        handleLineStringClick(e);
      } else if (drawMode === 'rectangle') {
        handleRectangleClick(e);
      } else if (drawMode === 'circle') {
        handleCircleClick(e);
      }
    };

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (!isDrawingRef.current) return;

      if (drawMode === 'polygon' && tempLineRef.current && pointsRef.current.length > 0) {
        const latlngs = [...pointsRef.current, e.latlng];
        tempLineRef.current.setLatLngs(latlngs);
      } else if (drawMode === 'linestring' && tempLineRef.current && pointsRef.current.length > 0) {
        const latlngs = [...pointsRef.current, e.latlng];
        tempLineRef.current.setLatLngs(latlngs);
      } else if (drawMode === 'rectangle' && startPointRef.current) {
        if (tempLineRef.current) {
          map.removeLayer(tempLineRef.current);
        }
        const bounds = L.latLngBounds(startPointRef.current, e.latlng);
        tempLineRef.current = L.rectangle(bounds, { color: '#3b82f6', weight: 2, fillOpacity: 0.1 }).addTo(map);
      } else if (drawMode === 'circle' && startPointRef.current && tempCircleRef.current) {
        const radius = startPointRef.current.distanceTo(e.latlng);
        tempCircleRef.current.setRadius(radius);
      }
    };

    const handlePolygonClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingRef.current) {
        const count = getFeatureCountByType('polygon');
        if (count >= shapeConfig.polygon) {
          setError(`Maximum ${shapeConfig.polygon} polygons allowed`);
          setDrawMode(null);
          return;
        }
        isDrawingRef.current = true;
        pointsRef.current = [e.latlng];
        tempLineRef.current = L.polyline([e.latlng], { color: '#3b82f6', weight: 2 }).addTo(map);
      } else {
        pointsRef.current.push(e.latlng);
      }
    };

    const handleLineStringClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingRef.current) {
        const count = getFeatureCountByType('linestring');
        if (count >= shapeConfig.linestring) {
          setError(`Maximum ${shapeConfig.linestring} line strings allowed`);
          setDrawMode(null);
          return;
        }
        isDrawingRef.current = true;
        pointsRef.current = [e.latlng];
        tempLineRef.current = L.polyline([e.latlng], { color: '#3b82f6', weight: 3 }).addTo(map);
      } else {
        pointsRef.current.push(e.latlng);
      }
    };

    const handleRectangleClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingRef.current) {
        const count = getFeatureCountByType('rectangle');
        if (count >= shapeConfig.rectangle) {
          setError(`Maximum ${shapeConfig.rectangle} rectangles allowed`);
          setDrawMode(null);
          return;
        }
        isDrawingRef.current = true;
        startPointRef.current = e.latlng;
      } else {
        finishRectangle(e.latlng);
      }
    };

    const handleCircleClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingRef.current) {
        const count = getFeatureCountByType('circle');
        if (count >= shapeConfig.circle) {
          setError(`Maximum ${shapeConfig.circle} circles allowed`);
          setDrawMode(null);
          return;
        }
        isDrawingRef.current = true;
        startPointRef.current = e.latlng;
        tempCircleRef.current = L.circle(e.latlng, { radius: 0, color: '#3b82f6', weight: 2, fillOpacity: 0.1 }).addTo(map);
      } else {
        finishCircle(e.latlng);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isDrawingRef.current) {
        if (drawMode === 'polygon') {
          finishPolygon();
        } else if (drawMode === 'linestring') {
          finishLineString();
        }
      } else if (e.key === 'Escape') {
        cancelDrawing();
      }
    };

    const finishPolygon = () => {
      if (pointsRef.current.length < 3) {
        setError('Polygon must have at least 3 points');
        cancelDrawing();
        return;
      }

      const coordinates = pointsRef.current.map(ll => [ll.lng, ll.lat]);
      coordinates.push(coordinates[0]);

      const polygonGeometry: Polygon = {
        type: 'Polygon',
        coordinates: [coordinates]
      };

      processPolygonalFeature(polygonGeometry, 'polygon');
    };

    const finishLineString = () => {
      if (pointsRef.current.length < 2) {
        setError('Line string must have at least 2 points');
        cancelDrawing();
        return;
      }

      const coordinates = pointsRef.current.map(ll => [ll.lng, ll.lat]);
      const lineStringGeometry: LineString = {
        type: 'LineString',
        coordinates
      };

      const feature: AppFeature = {
        type: 'Feature',
        id: `linestring-${Date.now()}`,
        geometry: lineStringGeometry,
        properties: {
          type: 'linestring',
          name: `LineString ${getFeatureCountByType('linestring') + 1}`,
          createdAt: new Date().toISOString()
        }
      };

      addFeature(feature);
      cancelDrawing();
      setError(null);
    };

    const finishRectangle = (endPoint: L.LatLng) => {
      if (!startPointRef.current) return;

      const bounds = L.latLngBounds(startPointRef.current, endPoint);
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const nw = L.latLng(ne.lat, sw.lng);
      const se = L.latLng(sw.lat, ne.lng);

      const coordinates = [
        [sw.lng, sw.lat],
        [se.lng, se.lat],
        [ne.lng, ne.lat],
        [nw.lng, nw.lat],
        [sw.lng, sw.lat]
      ];

      const rectangleGeometry: Polygon = {
        type: 'Polygon',
        coordinates: [coordinates]
      };

      processPolygonalFeature(rectangleGeometry, 'rectangle');
    };

    const finishCircle = (endPoint: L.LatLng) => {
      if (!startPointRef.current) return;

      const radius = startPointRef.current.distanceTo(endPoint);
      const center: [number, number] = [startPointRef.current.lng, startPointRef.current.lat];

      const circleGeometry = circleToPolygon(center, radius);
      processPolygonalFeature(circleGeometry, 'circle');
    };

    const processPolygonalFeature = (geometry: Polygon | MultiPolygon, type: DrawMode) => {
      const polygonalFeatures = features.filter(f => isPolygonalFeature(f.properties.type));

      const { hasOverlap, isFullyEnclosed, overlappingFeatures } = checkPolygonOverlap(
        { type: 'Feature', geometry, properties: {} },
        polygonalFeatures
      );

      if (isFullyEnclosed) {
        setError('Cannot create polygon that is fully enclosed by another polygon');
        cancelDrawing();
        return;
      }

      let finalGeometry = geometry;

      if (hasOverlap && overlappingFeatures.length > 0) {
        const trimmed = trimPolygonOverlaps(
          { type: 'Feature', geometry, properties: {} },
          overlappingFeatures
        );

        if (!trimmed) {
          setError('Polygon was completely overlapped and removed');
          cancelDrawing();
          return;
        }

        finalGeometry = trimmed.geometry;
      }

      const feature: AppFeature = {
        type: 'Feature',
        id: `${type}-${Date.now()}`,
        geometry: finalGeometry,
        properties: {
          type,
          name: `${type?.charAt(0).toUpperCase()}${type?.slice(1)} ${getFeatureCountByType(type) + 1}`,
          createdAt: new Date().toISOString()
        }
      };

      addFeature(feature);
      cancelDrawing();
      setError(null);
    };

    const cancelDrawing = () => {
      isDrawingRef.current = false;
      pointsRef.current = [];
      startPointRef.current = null;

      if (tempLineRef.current) {
        map.removeLayer(tempLineRef.current);
        tempLineRef.current = null;
      }

      if (tempCircleRef.current) {
        map.removeLayer(tempCircleRef.current);
        tempCircleRef.current = null;
      }
    };

    map.on('click', handleMapClick);
    map.on('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      map.off('click', handleMapClick);
      map.off('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      cancelDrawing();
    };
  }, [map, drawMode, features, addFeature, setDrawMode, getFeatureCountByType, shapeConfig]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return error ? (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
      {error}
    </div>
  ) : null;
};
