/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import React from "react";
import "./App.css";
import { useWorker } from "react-hooks-worker";
import {
  planetsPositionsList,
  parseDegree,
  zodiacSymbol,
  avoidCollision,
  parseDegreeNoZodiac,
  houses,
  colorTheme,
} from "./utils.js";
import { Text, Symbols, Line } from "./components/SVGComponents.jsx";
import GeoComp from "./components/Geo.jsx";
import { Cusps } from "./components/Chart-related.jsx";
import { DateTime } from "./lib/luxon.min.js";
function Circle({ radius, stroke }) {
  return (
    <>
      <circle
        cx="0"
        cy="0"
        r={radius}
        stroke="black"
        fill="none"
        strokeWidth={stroke}
      ></circle>
    </>
  );
}

function Planet({
  planet,
  lon,
  direction,
  radius_planet,
  radius_planet_degree,
  radius_planet_zodiac,
  radius_planet_minute,
  radius_planet_retro,
  sizeCanvas,
  planetNonCollision,
  leftDegree,
}) {
  const resPosition = parseDegree(lon);
  const fontsize_degree = "75%";
  const fontsize_zodiac = "75%";
  const fontsize_minute = "50%";
  const fontsize_retro = "40%";
  const element = Math.floor(resPosition.zodiac % 4);
  const color = colorTheme(element);
  return (
    <>
      <Symbols
        symbolName={planet}
        radius={radius_planet}
        theta={planetNonCollision}
        scale={0.05}
        sizeCanves={sizeCanvas}
        color={color}
        leftDegree={leftDegree}
      />
      <Text
        text={resPosition.degree}
        radius={radius_planet_degree}
        theta={planetNonCollision}
        // color="black"
        fontSize={fontsize_degree}
        leftDegree={leftDegree}
        fontWeight="bold"
      />
      <Text
        text={zodiacSymbol(resPosition.zodiac)}
        radius={radius_planet_zodiac}
        theta={planetNonCollision}
        color={color}
        fontSize={fontsize_zodiac}
        leftDegree={leftDegree}
        // fontWeight="normal"
      />
      <Text
        text={resPosition.minute}
        radius={radius_planet_minute}
        theta={planetNonCollision}
        // color={color}
        fontSize={fontsize_minute}
        leftDegree={leftDegree}
      />
      {direction && (
        <Text
          text={"R"}
          radius={radius_planet_retro}
          theta={planetNonCollision}
          color="red"
          fontSize={fontsize_retro}
          leftDegree={leftDegree}
        />
      )}
    </>
  );
}
function Chart({ planetState, planetNonCollision, cusps }) {
  const svgWidth = 404;

  const radius_out = 49;
  const radius_zodiac = 42;
  const radius_house = 20;
  const radius_inner = 15;

  const radius_planet = radius_zodiac * 0.8 + radius_house * 0.2;
  const radius_planet_degree = radius_zodiac * 0.57 + radius_house * 0.43;
  const radius_planet_zodiac = radius_zodiac * 0.36 + radius_house * 0.64;
  const radius_planet_minute = radius_zodiac * 0.205 + radius_house * 0.795;
  const radius_planet_retro = radius_house * 1.1;

  const short_length_pl = 0.1;
  const short_length_xtick_minor = 0.15;
  const short_length_xtick_major = 0.3;

  const linewidth_wide = 2;
  const linewidth_middle = 1;
  const linewidth_thin = 1;
  const linewidth_light = 0.3;
  const stroke = [5, 1, 1, 1]; //stroke of circles from outside to inside

  return (
    <svg
      viewBox={
        -svgWidth / 2 + " -" + svgWidth / 2 + " " + svgWidth + " " + svgWidth
      }
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
    >
      {[radius_out, radius_house, radius_zodiac, radius_inner].map(
        (r, index) => (
          <Circle key={r} radius={r + "%"} stroke={stroke[index]} />
        )
      )}
      <Cusps
        cusps={cusps}
        startRadius={radius_zodiac}
        length={radius_zodiac - radius_house}
        zodiacRadius={radius_zodiac * 0.5 + radius_out * 0.5}
      />
      {Object.keys(planetState).map((planet) => (
        // <React.Fragment>
        <React.Fragment key={planet}>
          <Planet
            planet={planet}
            lon={planetState[planet].lon}
            direction={planetState[planet].direction < 0}
            radius_planet={radius_planet}
            radius_planet_degree={radius_planet_degree}
            radius_planet_zodiac={radius_planet_zodiac}
            radius_planet_minute={radius_planet_minute}
            radius_planet_retro={radius_planet_retro}
            sizeCanvas={svgWidth}
            planetNonCollision={planetNonCollision[planet]}
            leftDegree={cusps[0]}
          />
          <Line
            startRadius={radius_zodiac}
            length={2}
            theta={planetState[planet].lon}
            leftDegree={cusps[0]}
          />
        </React.Fragment>
      ))}
    </svg>
  );
}
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
  const diff = 7; //avoid planets overlapped in chart

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
  // const worker = useWorker(new Worker("./js/sweph.js"));
  // const [result, setResult] = useState("");

  //Handle funs
  const handleHelio = () => {
    setHelio(!helio);
  };
  const handleTimeInputChange = (key, value) => {
    timeInputs.current = { ...timeInputs.current, [key]: value };
    const offsetInMinutes = parseFloat(timeInputs.current.offset) * 60;
    //Calculates
    const updatedDateTime = DateTime.fromObject(
      {
        year: parseInt(timeInputs.current.year),
        month: parseInt(timeInputs.current.month),
        day: parseInt(timeInputs.current.day),
        hour: parseInt(timeInputs.current.hour) || 0, // 时、分、秒等属性可以根据需要添加
        minute: parseInt(timeInputs.current.minute) || 0,
        second: parseInt(timeInputs.current.second) || 0,
      },
      { zone: offsetInMinutes }
    );
    if (updatedDateTime.isValid) {
      setDateTime(
        updatedDateTime.plus({
          seconds: (parseFloat(timeInputs.current.hour) % 1) * 3600,
        })
      );
    } else {
      triggerRerender();
    }
  };
  const handleLocationInputChange = (key, value) => {
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
  };
  const triggerRerender = () => {
    setForceRender((prev) => !prev);
  };
  // const handleCalculate = () => {
  //   const message = [
  //     parseInt(timeInputs.current.year),
  //     parseInt(timeInputs.current.month),
  //     parseInt(timeInputs.current.day),
  //     parseInt(timeInputs.current.hour),
  //     parseInt(timeInputs.current.minute),
  //     parseInt(timeInputs.current.second),
  //     parseInt(locationInputs.current.lonDeg),
  //     parseInt(locationInputs.current.lonMin),
  //     parseInt(locationInputs.current.lonSec),
  //     "E", //sLonEW,
  //     parseInt(locationInputs.current.latDeg),
  //     parseInt(locationInputs.current.latMin),
  //     parseInt(locationInputs.current.latSec),
  //     "N", //sLatNS,
  //     "P", //sHouse,
  //   ];
  //   worker.postMessage(message);
  // };

  // // useEffect for handling worker messages
  // useEffect(() => {
  //   const handleWorkerMessage = (event) => {
  //     const jsonResult = JSON.parse(event.data);
  //     setResult(jsonResult);
  //   };

  //   worker.addEventListener("message", handleWorkerMessage);

  //   return () => {
  //     worker.removeEventListener("message", handleWorkerMessage);
  //   };
  // }, [worker]);

  // // useEffect for updating time
  // useEffect(() => {
  //   const updateTime = () => {
  //     const newTime = DateTime.local();
  //     setDateTime(newTime);
  //     timeInputs.current = {
  //       year: newTime.year,
  //       month: newTime.month,
  //       day: newTime.day,
  //       hour: newTime.hour,
  //       minute: newTime.month,
  //       second: newTime.second,
  //       offset: newTime.offset / 60,
  //     };
  //   };

  //   updateTime(); // Call on mount
  // }, []); // Empty dependency array ensures it runs only once

  //Updates funs
  const updateGeo = (newLocation) => {
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
  };
  const updateTime = () => {
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
  };

  const planetState = planetsPositionsList(dateTime.toJSDate(), helio);
  const planetNonCollision = avoidCollision(planetState, diff);
  const cusps = houses(
    dateTime.toJSDate(),
    location.longitude,
    location.latitude
  );

  return (
    <main className="flex flex-col items-center">
      <p>{dateTime.toString()}</p>
      <button onClick={handleHelio}>
        {helio ? "Heliocentric" : "Geocentric"}
      </button>

      <div className="grid grid-cols-2 gap-4">
        <GeoComp updateGeo={updateGeo} />
        <button onClick={updateTime}>Get Time</button>
      </div>
      <Inputs
        timeInputs={timeInputs.current}
        handleTimeInputsChange={handleTimeInputChange}
        locationInputs={locationInputs.current}
        handleLocationInputsChange={handleLocationInputChange}
      />
      <Chart
        planetState={planetState}
        planetNonCollision={planetNonCollision}
        cusps={cusps}
      />
    </main>
  );
}

export default App;
