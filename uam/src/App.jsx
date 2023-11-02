/* global window */
import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';
import {IconLayer} from "@deck.gl/layers";
import buildings from "./data/buildings.json"
import trip from "./data/trip.json"
import ps from "./data/ps.json"
// Source data CSV
const DATA_URL = {
  BUILDINGS: buildings,
  TRIPS: trip,
  PS: ps
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = { 
  longitude: 126.98, // 126.98 , -74
  latitude: 37.57, // 37.57 , 40.72
  zoom: 11,
  pitch: 45,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};



export default function App({
  buildings = DATA_URL.BUILDINGS,
  trips = DATA_URL.TRIPS,
  ps = DATA_URL.PS,
  trailLength = 1,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 100, // unit corresponds to the timestamp in source data
  animationSpeed = 2 
}) {
  const [time, setTime] = useState(0);
  const [animation] = useState({});

  const animate = () => { 
    setTime(t => (t + 0.01 * animationSpeed) % loopLength);
    animation.id = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation]);

  const layers = [
    new TripsLayer({  
      id: 'trips',
      data: trips,
      getPath: d => d.route,
      getTimestamps: d => d.timestamp,
      getColor: [255, 0, 0],
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength,
      currentTime: time,

      shadowEnabled: false
    }),
    new PolygonLayer({
      id: 'buildings',
      data: buildings,
      extruded: true,
      wireframe: false,
      opacity: 0.5,
      getPolygon: f => f.coordinates,
      getElevation: f => f.height,
      getFillColor: theme.buildingColor,
      material: theme.material
    }),
    new IconLayer({
      id: "ps",
      data: ps,
      sizeScale: 10,
      iconAtlas:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "marker",
      getSize: (d) => 1,
      getPosition: (d) => d.route,
      getColor: (d) => [255, 255, 0],
      opacity: 0.3,
      pickable: false,
      radiusMinPixels: 2,
      radiusMaxPixels: 2,
    }),
    new TripsLayer({  
      id: 'trips',
      data: ps,
      getPath: d => d.route,
      getTimestamps: d => d.timestamp,
      getColor: [255, 0, 255],
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength,
      currentTime: time,
      shadowEnabled: false
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      effects={theme.effects}
      initialViewState={initialViewState}
      controller={true}
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

// export function renderToDOM(container) {
//   createRoot(container).render(<App />);
// }
