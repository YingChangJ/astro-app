/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import React from "react";
import "./App.css";
import { planetsPositionsList, parseDegreeNoZodiac, houses } from "./utils.js";
import GeoComp from "./components/Geo.jsx";
import { DateTime } from "./lib/luxon.min.js";

function Inputs({
  timeInputs,
  locationInputs,
  handleTimeInputsChange,
  handleLocationInputsChange,
}) {
  const renderInput = (inputs, handleChange) =>
    Object.keys(inputs).map((param) => (
      <div key={param} className="mb-2 text-center">
        <label>{param}</label>
        <input
          className="w-full md:w-12 lg:w-12 text-center"
          type="number"
          step="any"
          value={inputs[param]}
          onChange={(e) => handleChange(param, e.target.value)}
        />
      </div>
    ));
  return (
    <>
      <section className="grid grid-cols-3 gap-2">
        {renderInput(timeInputs, handleTimeInputsChange)}
      </section>
      <section className="grid grid-cols-3 gap-2">
        {renderInput(locationInputs, handleLocationInputsChange)}
      </section>
    </>
  );
}
function App() {
  const inputsParametersTime = [
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "offset",
  ];
  const inputsParametersLocation = [
    "lonDeg",
    "lonMin",
    "lonSec",
    "latDeg",
    "latMin",
    "latSec",
  ];

  //Hooks
  const [helio, setHelio] = useState(false);
  //location and datetime: they are
  const [dateTime, setDateTime] = useState(DateTime.utc());
  const [location, setLocation] = useState({ longitude: 0, latitude: 0 });
  //record inputs
  const timeInputs = useRef(
    Object.fromEntries(
      inputsParametersTime.map((param) => [param, dateTime[param]])
    )
  );
  const locationInputs = useRef(
    Object.fromEntries(inputsParametersLocation.map((param) => [param, 0]))
  );
  //others
  const [, setForceRender] = useState(false);
  const isOver1800 = useRef(true);

  //Handle funs
  function handleHelio() {
    setHelio(!helio);
  }
  function handleTimeInputChange(key, value) {
    timeInputs.current = { ...timeInputs.current, [key]: value };
    const offsetInMinutes = (parseFloat(timeInputs.current.offset) || 0) * 60;
    //Calculates
    // if (isNaN(parseInt(timeInputs.current.year))) {
    //   triggerRerender();
    //   console.log(timeInputs.current.year);
    //   return;
    // }
    console.log(timeInputs.current.year);
    const updatedDateTime = DateTime.fromObject(
      {
        year: parseInt(timeInputs.current.year) || 2000,
        month: parseInt(timeInputs.current.month) || 1,
        day: parseInt(timeInputs.current.day) || 1,
        hour: parseInt(timeInputs.current.hour) || 0, // 时、分、秒等属性可以根据需要添加
        minute: parseInt(timeInputs.current.minute) || 0,
        second: parseInt(timeInputs.current.second) || 0,
      },
      { zone: offsetInMinutes }
    );
    if (updatedDateTime.isValid) {
      const takeFractionalHour = updatedDateTime.plus({
        seconds: ((parseFloat(timeInputs.current.hour) || 0) % 1) * 3600,
      });
      setDateTime(takeFractionalHour);
      const yearToCheck = takeFractionalHour.toUTC().year;
      if (yearToCheck >= 1800 && yearToCheck <= 2400) {
        isOver1800.current = true;
      } else {
        isOver1800.current = false;
      }
    } else {
      triggerRerender();
    }
  }
  function handleLocationInputChange(key, value) {
    locationInputs.current = { ...locationInputs.current, [key]: value };
    const { lonDeg, latDeg, lonMin, latMin, lonSec, latSec } =
      locationInputs.current;
    const longitude =
      parseFloat(lonDeg) + parseFloat(lonMin) / 60 + parseFloat(lonSec) / 3600;
    const latitude =
      parseFloat(latDeg) + parseFloat(latMin) / 60 + parseFloat(latSec) / 3600;

    if (!isNaN(longitude) && !isNaN(latitude)) {
      setLocation({ longitude, latitude });
    } else {
      triggerRerender();
    }
  }
  function triggerRerender() {
    setForceRender((prev) => !prev);
  }

  //Updates funs
  function updateGeo(newLocation) {
    const lat = parseDegreeNoZodiac(newLocation.latitude);
    const lon = parseDegreeNoZodiac(newLocation.longitude);
    locationInputs.current = {
      lonDeg: lon.degree,
      lonMin: lon.minute,
      lonSec: lon.second,
      latDeg: lat.degree,
      latMin: lat.minute,
      latSec: lat.second,
    };
    setLocation(newLocation);
  }
  function updateTime() {
    const newTime = DateTime.local();
    setDateTime(DateTime.local());
    timeInputs.current = {
      year: newTime.year,
      month: newTime.month,
      day: newTime.day,
      hour: newTime.hour,
      minute: newTime.month,
      second: newTime.second,
      offset: newTime.offset / 60,
    };
  }
  function clearInputs() {
    inputsParametersTime.forEach((key) => {
      timeInputs.current[key] = "";
    });
    inputsParametersLocation.forEach((key) => {
      locationInputs.current[key] = "";
    });
    triggerRerender();
  }
  let planetState,
    cusps = undefined;
  if (isOver1800.current) {
    const wasm = JSON.parse(
      window.Module.ccall(
        "get",
        "string",
        [
          "number",
          "number",
          "number",
          "number",
          "number",
          "number",
          "number",
          "number",
          "string",
          "number",
        ],
        [
          dateTime.toUTC().year,
          dateTime.toUTC().month,
          dateTime.toUTC().day,
          dateTime.toUTC().hour,
          dateTime.toUTC().minute,
          dateTime.toUTC().second,
          location.longitude,
          location.latitude,
          "P",
          258 | (helio ? 8 : 0),
        ]
      )
    );
    cusps = wasm.house.map((item) => item.long);
    planetState = wasm.planets.reduce((result, item) => {
      if (item.name !== "intp. Apogee" && item.name !== "intp. Perigee") {
        result[item.name] = { lon: item.long, speed: item.speed };
      }
      return result;
    }, {});
  } else {
    planetState = planetsPositionsList(dateTime.toJSDate(), helio);
    cusps = houses(dateTime.toJSDate(), location.longitude, location.latitude);
  }

  return (
    <main className="flex flex-col items-center">
      <div className="flex gap-4">
        <Link to="/">Chart</Link>
        <Link to="vedic">Vedic</Link>
        <Link to="bazi">Bazi</Link>
      </div>
      <p>{dateTime.toString()}</p>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={handleHelio}>
          {helio ? "Heliocentric" : "Geocentric"}
        </button>
        <button onClick={clearInputs}>Clear</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <GeoComp updateGeo={updateGeo} />
        <button onClick={updateTime}>Get Time</button>
      </div>
      <div>
        <Inputs
          timeInputs={timeInputs.current}
          handleTimeInputsChange={handleTimeInputChange}
          locationInputs={locationInputs.current}
          handleLocationInputsChange={handleLocationInputChange}
        />
      </div>

      <Outlet context={[planetState, cusps]} />
      {/* <script type="module" src="/astro.js"></script> */}
    </main>
  );
}

export default App;
