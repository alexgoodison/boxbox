"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

export default function Track({ trackGeojson }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const coordinates = trackGeojson.features[0].geometry.coordinates;

  useEffect(() => {
    if (coordinates.length === 0) return;

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
        data: trackGeojson,
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

      // Create the circle layer initially at the first coordinate
      mapRef.current.addLayer({
        id: "circle",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: coordinates[0], // Start at first coordinate
                },
              },
            ],
          },
        },
        paint: {
          "circle-radius": 6,
          "circle-color": "#f00",
        },
      });

      // Function to animate the circle
      let currentIndex = 0;
      const animateCircle = () => {
        currentIndex = (currentIndex + 1) % coordinates.length; // Loop through coordinates
        const currentCoordinate = coordinates[currentIndex];

        // Update the circle's position
        mapRef.current.getSource("circle").setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: currentCoordinate,
              },
            },
          ],
        });
      };

      // Start the animation loop
      const intervalId = setInterval(animateCircle, 100); // Adjust interval for desired speed

      // Clear interval on component unmount
      return () => clearInterval(intervalId);
    });

    return () => {
      mapRef.current.remove();
    };
  }, [trackGeojson]);

  return (
    <div
      id="mapContainer"
      ref={mapContainerRef}
      className="w-[800px] rounded-sm h-[500px] bg-white"
    />
  );
}
