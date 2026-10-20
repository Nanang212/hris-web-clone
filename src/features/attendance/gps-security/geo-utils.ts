// geo-utils.ts — Geodesic geometry utilities for MapLibre
import type * as GeoJSON from 'geojson'

/**
 * Creates a GeoJSON Polygon circle around a [longitude, latitude] point with radius in meters
 */
export function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  points = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center
  const coords: [number, number][] = []
  const km = radiusInMeters / 1000

  const distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180))
  const distanceY = km / 110.574

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    const x = distanceX * Math.cos(theta)
    const y = distanceY * Math.sin(theta)
    coords.push([lng + x, lat + y])
  }
  coords.push(coords[0]) // Close polygon loop

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  }
}
