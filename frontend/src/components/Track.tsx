"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

export default function Track({ trackGeojson }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [9.286905, 45.622049],
      zoom: 13.8,
      bearing: 95,
    });

    mapRef.current.on("load", async () => {
      mapRef.current.addSource("track", {
        type: "geojson",
        data: JSON.parse(trackGeojson),
      });

      mapRef.current.addLayer({
        id: "outline",
        type: "line",
        source: "track",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 4,
        },
      });
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <div
      id="mapContainer"
      ref={mapContainerRef}
      className="w-[800px] rounded-sm h-[500px] bg-white"
    />
  );
}
