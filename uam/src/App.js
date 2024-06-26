import "mapbox-gl/dist/mapbox-gl.css";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import Splash from "./components/Splash";
import Trip from "./components/Trip";
import "./css/app.css";

const fetchData = (FilE_NAME) => {
  const res = axios.get(
    `https://raw.githubusercontent.com/HNU209/DTUMOS_UAM/main/uam/src/data/${FilE_NAME}.json`
  );
  const data = res.then((r) => r.data);
  return data;
};

const App = () => {
  const [icon, setIcon] = useState([]);

  const [trip, setTrip] = useState([]);
  const [passenger, setPassenger] = useState([]);
  const [passenger_ov, setPassenger_ov] = useState([]);
  const [passenger_dv, setPassenger_dv] = useState([]);

  const [building, setBuilding] = useState([]);
  const [building_vertiport, setBuildingVertiport] = useState([]);

  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  const [snodes, setSNodes] = useState([])
  const [slinks, setSLinks] = useState([]);

  const [isloaded, setIsLoaded] = useState(false);

  const getData = useCallback(async () => {
    const ICON = await fetchData("icon_data");
    const TRIP = await fetchData("trips");
    const PASSENGER = await fetchData("ps");
    const PASSENGER_OV = await fetchData("ps_OV");
    const PASSENGER_DV = await fetchData("ps_DV");
    const BUILDING = await fetchData("buildings");
    const BUILDING_VERTIPORT = await fetchData("building_vertiport");
    const NODES = await fetchData("nodes");
    const LINKS = await fetchData("links");

    const SNODES = await Promise.all([
      fetchData("bus_icon"),
      fetchData("trail_icon"),
    ]);

    const SLINKS = await Promise.all([
      fetchData("bus_line"),
      fetchData("trail_line"),
    ]);

    setIcon((prev) => ICON);
    setTrip((prev) => TRIP);
    setPassenger((prev) => PASSENGER);
    setPassenger_ov((prev) => PASSENGER_OV);
    setPassenger_dv((prev) => PASSENGER_DV);
    setBuilding((prev) => BUILDING);
    setBuildingVertiport((prev) => BUILDING_VERTIPORT);
    setNodes((prev) => NODES);
    setLinks((prev) => LINKS);

    setSNodes((prev) => SNODES.flat());
    setSLinks((prev) => SLINKS.flat());

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="container">
      {!isloaded && <Splash />}
      {isloaded && (
        <Trip trip={trip}
              passenger={passenger} 
              passenger_ov={passenger_ov} 
              passenger_dv={passenger_dv} 

              building={building}
              building_vertiport={building_vertiport}

              icon={icon}

              nodes={nodes}
              links={links} 

              snodes={snodes}
              slinks={slinks} 


              />
      )}
    </div>
  );
};

export default App;
