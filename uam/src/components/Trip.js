/* global window */
import React, { useState, useEffect, useCallback } from "react";

import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';

import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';
import {IconLayer} from "@deck.gl/layers";
import {ScatterplotLayer} from "@deck.gl/layers";
import {LineLayer} from "@deck.gl/layers";

import Slider from "@mui/material/Slider";
import legend from "../image/legend.png";
import "../css/trip.css";


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

const material2 = {
  ambient: 0.3,
  diffuse: 0.6,
  shininess: 32,
  specularCol: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [228, 228, 228],
  buildingColor2: [255, 255, 255],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  material2,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = { 
  longitude: 126.98, // 126.98 , -74
  latitude: 37.57, // 37.57 , 40.72
  zoom: 10,
  pitch: 45,
  bearing: 0
};

const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

const minTime = 0;
const maxTime = 730;
const animationSpeed = 1;
const mapStyle = "mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc";
const MAPBOX_TOKEN = `pk.eyJ1Ijoic2hlcnJ5MTAyNCIsImEiOiJjbG00dmtic3YwbGNoM2Zxb3V5NmhxZDZ6In0.ZBrAsHLwNihh7xqTify5hQ`;

const returnAnimationTime = (time) => {
    if (time > maxTime) {
      return minTime;
    } else {
      return time + 0.01 * animationSpeed;
    }
  };
  
  const addZeroFill = (value) => {
    const valueString = value.toString();
    return valueString.length < 2 ? "0" + valueString : valueString;
  };
  
  const returnAnimationDisplayTime = (time) => {
    const hour = addZeroFill(parseInt((Math.round(time) / 60) % 24));
    const minute = addZeroFill(Math.round(time) % 60);
    return [hour, minute];
  };
  
  const currData = (data, time) => {
    const arr = [];
    data.forEach((v) => {
      const timestamp = v.timestamp;
      const s_t = timestamp[0];
      const e_t = timestamp[timestamp.length - 1];
      if (s_t <= time && e_t >= time) {
        arr.push(v);
      }
    });
    return arr;
  };


const Trip = (props) => {
  const [time, setTime] = useState(minTime);
  const [animation] = useState({});

  const icon = props.icon;
  const trip = props.trip;
  const ps = currData(props.passenger, time);
  const ps_ov = props.passenger_ov;
  const building = props.building;
  const building_vertiport = props.building_vertiport;
  const nodes = props.nodes;
  const links = props.links;



  const animate = useCallback(() => {
    setTime((time) => returnAnimationTime(time));
    animation.id = window.requestAnimationFrame(animate);
  }, [animation]);

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation, animate]);

  const layers = [
    new IconLayer({
      id: "location",
      data: icon,
      sizeScale: 7,
      iconAtlas:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: d => "marker",
      getSize: 2,
      getPosition: d => d.coordinates,
      getColor: d => d.color,
      opacity: 1,
      mipmaps: false,
      pickable: true,
      radiusMinPixels: 2,
      radiusMaxPixels: 2,
    }),
    new TripsLayer({  
      id: 'trips',
      data: trip,
      getPath: d => d.route,
      getTimestamps: d => d.timestamp,
      getColor: [255, 0, 255],
      opacity: 0.7,
      widthMinPixels: 3,
      rounded: true,
      trailLength : 0.5,
      currentTime: time,
      shadowEnabled: false
    }),
    new TripsLayer({  
      id: 'trips',
      data: ps,
      getPath: d => d.route,
      getTimestamps: d => d.timestamp,
      getColor: [255, 255, 50],
      opacity: 0.7,
      widthMinPixels: 3,
      rounded: true,
      trailLength : 0.5,
      currentTime: time,
      shadowEnabled: false
    }),
    new TripsLayer({  
      id: 'trips',
      data: ps_ov,
      getPath: d => d.path,
      getTimestamps: d => d.timestamp,
      getColor: d =>{
        const vendorColorMap = {
          0: [255, 255, 0], 
          1: [0, 255, 0],   
          2: [0, 0, 255],   
          3: [0, 0, 128]
        };
        return vendorColorMap[d.vendor] || [255, 255, 50];
      },
      opacity: 0.7,
      widthMinPixels: 3,
      rounded: true,
      trailLength : 0.4,
      currentTime: time,
      shadowEnabled: false
    }),
    
    new LineLayer({
      id: 'line-layer',
      data: links,
      getSourcePosition: d => nodes.find(node => node.name === d.source).coordinates,
      getTargetPosition: d => nodes.find(node => node.name === d.target).coordinates,
      getColor: [200,200,200],
      opacity:0.3,
      highlight_color: [255, 255, 0],
      auto_highlight: true,
      // picking_radius: 10,
      widthMinPixels: 1,
    }),

    // new ScatterplotLayer({
    //   id : "ScatterplotLayer",
    //   data : nodes,
    //   pickable:true,
    //   opacity:0.8,
    //   stroked:true,
    //   filled:true,
    //   radiusScale:1,
    //   radiusMinPixels:1,
    //   radiusMaxPixels:10,
    //   lineWidthMinPixels: 1,
    //   getPosition: d => d.coordinates,
    //   getRradius: d => 100,
    //   getFillColor:[255, 0, 0],
    //   getLineColor:[255, 0, 0],
    // }),

    new PolygonLayer({
      id: 'buildings',
      data: building,
      extruded: true,
      wireframe: false,
      opacity: 0.5,
      getPolygon: f => f.coordinates,
      getElevation: f => f.height,
      getFillColor: DEFAULT_THEME.buildingColor,
      material: DEFAULT_THEME.material
    }),
    new PolygonLayer({
      id: 'buildings',
      data: building_vertiport,
      extruded: true,
      wireframe: false,
      opacity: 0.01,
      getPolygon: f => f.coordinates,
      getElevation: f => f.height,
      getFillColor: DEFAULT_THEME.buildingColor2,
      material: DEFAULT_THEME.material2
    })
  ];
  
  const SliderChange = (value) => {
    const time = value.target.value;
    setTime(time);
  };

  const [hour, minute] = returnAnimationDisplayTime(time);

  return (
    <div className="trip-container" style={{ position: "relative" }}>
      <DeckGL
        effects={DEFAULT_THEME.effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={mapStyle} mapboxAccessToken={MAPBOX_TOKEN} preventStyleDiffing={true}/>
      </DeckGL>
      <h1 className="time">TIME : {`${hour} : ${minute}`}</h1>
      <Slider
        id="slider"
        value={time}
        min={minTime}
        max={maxTime}
        onChange={SliderChange}
        track="inverted"
      />
      <img className="legend" src={legend} alt="legend"
            style={{ position: "absolute", top: "30px", left: "50px", width: "10%", height: "13.2%" }}></img>
    </div>
  );
};

export default Trip;
