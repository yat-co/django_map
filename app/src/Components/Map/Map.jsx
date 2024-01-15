import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { combine } from "@turf/turf";

import useFetch from "../FetchData/FetchData";


const routePath = [
  {
    display: "Salina, KS",
    longitude: -97.621054,
    latitude: 38.844947,
    marker: "blue_donut",
  },
  {
    display: "Hays, KS 67601",
    longitude: -99.331734,
    latitude: 38.848648,
    marker: "purple_cirle",
  },
  {
    display: "Indianapolis, IN 46255",
    longitude: -86.158,
    latitude: 39.7684,
    marker: "purple_cirle",
  },
  {
    display: "Greeneville, TN 37744",
    longitude: -82.8548,
    latitude: 36.1683,
    marker: "purple_cirle",
  },
  {
    display: "Kingsport Metro Area, TN",
    longitude: -82.567216,
    latitude: 36.568319,
    marker: "blue_donut",
  },
];

const startLine = {
  type: "FeatureCollection",
  features: [],
};
const endLine = {
  type: "FeatureCollection",
  features: [],
};
const midLine = {
  type: "FeatureCollection",
  features: [],
};

const addRouteToMap = (mapboxRoute, map) => {
  if (!map.current) return;

  if (mapboxRoute.code === "Ok") {
    const legsLength = mapboxRoute.routes[0].legs.length;
    mapboxRoute.routes[0].legs.forEach((step, index) => {
      if (index === 0) {
        step.steps.forEach((feature) => {
          startLine.features.push({
            type: "Feature",
            geometry: feature.geometry,
          });
        });
      } else if (index === legsLength - 1) {
        step.steps.forEach((feature) => {
          endLine.features.push({
            type: "Feature",
            geometry: feature.geometry,
          });
        });
      } else {
        step.steps.forEach((feature) => {
          midLine.features.push({
            type: "Feature",
            geometry: feature.geometry,
          });
        });
      }
    });
  } else {
    throw new Error("something broke");
  }
  const featureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  // Filter out points route waypoints that are not viable points but rather
  // are exception routing points
  routePath
    .filter((el) => el.display !== null)
    .forEach((el) => {
      let feature = {
        type: "Feature",
        properties: el,
        geometry: {
          type: "Point",
          coordinates: [el.longitude, el.latitude],
        },
      };
      featureCollection.features.push(feature);
    });

  map.current.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-traffic-v1",
    tileSize: 512,
  });

  map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.0 });

  map.current.addSource("route_markers", {
    type: "geojson",
    data: featureCollection,
  });

  map.current.addLayer({
    id: "startend",
    source: "route_markers",
    type: "circle",
    paint: {
      "circle-radius": 5,
      "circle-color": "#7776ec",
      "circle-opacity": 1,
      "circle-stroke-width": 0,
    },
    filter: ["==", "marker", "purple_cirle"],
  });
  map.current.addLayer({
    id: "circles2",
    source: "route_markers",
    type: "circle",
    paint: {
      "circle-radius": 3,
      "circle-opacity": 0,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#76b0ec",
      "circle-stroke-opacity": 1,
    },
    filter: ["==", "marker", "blue_donut"],
  });
  map.current.addLayer({
    id: "labels",
    type: "symbol",
    source: "route_markers",
    layout: {
      "text-field": ["get", "display"],
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 0.5,
      "text-justify": "auto",
      "text-size": 12,
    },
    // "paint":{
    //     "text-color":"#ffffff"
    // }
  });

  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // Display Hover
  map.current.on('mouseenter', 'labels', (e) => {
    console.log("Mouse Enter", e)
    // Change the cursor style as a UI indicator.
    map.current.getCanvas().style.cursor = 'pointer';

    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    console.log(coordinates, e.lngLat)
    const description = e.features[0].properties.display;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    // }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(map.current);
  });

  map.current.on('mouseleave', 'labels', () => {
    map.current.getCanvas().style.cursor = '';
    popup.remove();
  });


  const startLineFC = combine(startLine);
  const midLineFC = combine(midLine);
  const endLineFC = combine(endLine);
  map.current.addSource("startLine", {
    type: "geojson",
    data: startLineFC,
  });
  map.current.addSource("midLine", {
    type: "geojson",
    data: midLineFC,
  });
  map.current.addSource("endLine", {
    type: "geojson",
    data: endLineFC,
  });
  map.current.addLayer({
    id: "startLineLayer",
    type: "line",
    source: "startLine",
    paint: {
      "line-color": "#909297",
      "line-width": 3,
      "line-dasharray": [2, 1],
    },
  });
  map.current.addLayer({
    id: "endLineLayer",
    type: "line",
    source: "endLine",
    paint: {
      "line-color": "#909297",
      "line-width": 3,
      "line-dasharray": [2, 1],
    },
  });
  map.current.addLayer({
    id: "midLineLayer",
    type: "line",
    source: "midLine",
    paint: {
      "line-color": "#7776EC",
      "line-width": 3,
    },
  });
};

export const Map = () => {
  const mapboxKey = process.env.REACT_APP_MAPBOX_TOKEN;
  mapboxgl.accessToken = mapboxKey;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const longLatMapboxStr = `-97.621054,38.844947;-99.331734,38.848648;-86.158,39.7684;-82.8548,36.1683;-82.567216,36.568319`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${longLatMapboxStr}?&access_token=${mapboxKey}&alternatives=false&exclude=ferry&geometries=geojson&language=en&steps=true&overview=simplified`;
  const { status, data } = useFetch(url);

  console.log("Status", status, data);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-day-v1",
      attributionControl: false,
      bounds: [
        [-80.8907642, 40.12841],
        [-101.00818579999999, 35.80829],
      ],
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (status === "fetched") {
      map.current.on("load", () => { addRouteToMap(data, map); });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return <div ref={mapContainer} className="route-map-container" />;
};
