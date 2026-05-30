"use client";
import { useEffect } from "react";
import maplibregl from "maplibre-gl";

interface Waypoint {
  lat: number;
  lng: number;
  label: string;
}

interface RouteOverlayProps {
  map: maplibregl.Map;
  waypoints: Waypoint[];
  id: string;
}

export function RouteOverlay({ map, waypoints, id }: RouteOverlayProps) {
  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    const sourceId = `route-source-${id}`;
    const layerId = `route-layer-${id}`;

    if (map.getSource(sourceId)) {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: waypoints.map((w) => [w.lng, w.lat]),
        },
        properties: {},
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 3,
        "line-dasharray": [2, 1],
        "line-opacity": 0.7,
      },
    });

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, waypoints, id]);

  return null;
}
