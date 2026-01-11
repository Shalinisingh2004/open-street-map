import * as turf from '@turf/turf';
import { Feature, Polygon, MultiPolygon } from 'geojson';
import { AppFeature } from '../types';

export const isPolygonalFeature = (type: string | null): boolean => {
  return type === 'circle' || type === 'rectangle' || type === 'polygon';
};

export const checkPolygonOverlap = (
  newFeature: Feature<Polygon | MultiPolygon>,
  existingFeatures: AppFeature[]
): { hasOverlap: boolean; isFullyEnclosed: boolean; overlappingFeatures: AppFeature[] } => {
  const overlappingFeatures: AppFeature[] = [];
  let isFullyEnclosed = false;

  for (const existing of existingFeatures) {
    if (!isPolygonalFeature(existing.properties.type)) {
      continue;
    }

    try {
      const existingPolygon = existing.geometry as Polygon | MultiPolygon;

      const intersection = turf.intersect(
        turf.feature(newFeature.geometry),
        turf.feature(existingPolygon)
      );

      if (intersection) {
        overlappingFeatures.push(existing);

        const newArea = turf.area(turf.feature(newFeature.geometry));
        const intersectionArea = turf.area(intersection);

        if (Math.abs(newArea - intersectionArea) < 0.01) {
          isFullyEnclosed = true;
          break;
        }
      }

      const newWithin = turf.booleanWithin(
        turf.feature(newFeature.geometry),
        turf.feature(existingPolygon)
      );

      if (newWithin) {
        isFullyEnclosed = true;
        break;
      }
    } catch (error) {
      console.warn('Error checking overlap:', error);
    }
  }

  return {
    hasOverlap: overlappingFeatures.length > 0,
    isFullyEnclosed,
    overlappingFeatures
  };
};

export const trimPolygonOverlaps = (
  newFeature: Feature<Polygon | MultiPolygon>,
  overlappingFeatures: AppFeature[]
): Feature<Polygon | MultiPolygon> | null => {
  let trimmedFeature = turf.feature(newFeature.geometry);

  for (const existing of overlappingFeatures) {
    try {
      const existingPolygon = existing.geometry as Polygon | MultiPolygon;

      const difference = turf.difference(
        trimmedFeature,
        turf.feature(existingPolygon)
      );

      if (!difference) {
        return null;
      }

      trimmedFeature = difference as Feature<Polygon | MultiPolygon>;
    } catch (error) {
      console.warn('Error trimming polygon:', error);
    }
  }

  const area = turf.area(trimmedFeature);
  if (area < 1) {
    return null;
  }

  return trimmedFeature;
};

export const circleToPolygon = (
  center: [number, number],
  radiusInMeters: number,
  steps: number = 64
): Polygon => {
  const circle = turf.circle(center, radiusInMeters / 1000, {
    steps,
    units: 'kilometers'
  });
  return circle.geometry;
};
