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
  const [building, setBuilding] = useState([]);
  const [building_vertiport, setBuildingVertiport] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  const [isloaded, setIsLoaded] = useState(false);

  const getData = useCallback(async () => {
    const ICON = await fetchData("icon_data");
    const TRIP = await fetchData("trips");
    const PASSENGER = await fetchData("ps");
    const PASSENGER_OV = await fetchData("ps_OV");
    const BUILDING = await fetchData("buildings");
    const BUILDING_VERTIPORT = await fetchData("building_vertiport");
    const NODES = await fetchData("nodes");
    const LINKS = await fetchData("links");

    setIcon((prev) => ICON);
    setTrip((prev) => TRIP);
    setPassenger((prev) => PASSENGER);
    setPassenger_ov((prev) => PASSENGER_OV);
    setBuilding((prev) => BUILDING);
    setBuildingVertiport((prev) => BUILDING_VERTIPORT);
    setNodes((prev) => NODES);
    setLinks((prev) => LINKS);

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="container">
      {!isloaded && <Splash />}
      {isloaded && (
        <Trip trip={trip} building={building} building_vertiport={building_vertiport}
              passenger={passenger} passenger_ov={passenger_ov} icon={icon}
              nodes={nodes} links={links} />
      )}
    </div>
  );
};

export default App;
