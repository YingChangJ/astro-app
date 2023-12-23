/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import React from "react";
import "./App.css";
import {
  planetsPositionsList,
  parseDegree,
  zodiacSymbol,
  avoidCollision,
  parseDegreeNoZodiac,
} from "./utils.js";
import { Text, Symbols, Line } from "./components/SVGComponents.jsx";
import GeoComp from "./components/Geo.jsx";
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
}) {
  const resPosition = parseDegree(lon);
  const fontsize_degree = "80%";
  const fontsize_zodiac = "80%";
  const fontsize_minute = "50%";
  const fontsize_retro = "40%";
  const element = Math.floor(resPosition.zodiac % 4);
  const color = ["#cc0000", "#f1c232", "#3d85c6", "#6aa84f"][element];
  return (
    <>
      <Symbols
        symbolName={planet}
        radius={radius_planet}
        theta={planetNonCollision}
        scale={0.05}
        sizeCanves={sizeCanvas}
        color={color}
      />
      <Text
        text={resPosition.degree}
        radius={radius_planet_degree}
        theta={planetNonCollision}
        // color="black"
        fontSize={fontsize_degree}
      />
      <Text
        text={zodiacSymbol(resPosition.zodiac)}
        radius={radius_planet_zodiac}
        theta={planetNonCollision}
        color={color}
        fontSize={fontsize_zodiac}
        // fontWeight="normal"
      />
      <Text
        text={resPosition.minute}
        radius={radius_planet_minute}
        theta={planetNonCollision}
        // color={color}
        fontSize={fontsize_minute}
      />
      {direction && (
        <Text
          text={"R"}
          radius={radius_planet_retro}
          theta={planetNonCollision}
          color="red"
          fontSize={fontsize_retro}
        />
      )}
    </>
  );
}
function Chart({ planetState, planetNonCollision }) {
  const svgWidth = 404;

  const radius_zodiac_num = 42;
  const radius_house_num = 20;

  const radius_out = "49%";
  const radius_zodiac = radius_zodiac_num + "%";
  const radius_house = radius_house_num + "%";
  const radius_inner = "15%";

  const radius_planet = radius_zodiac_num * 0.8 + radius_house_num * 0.2;
  const radius_planet_degree =
    radius_zodiac_num * 0.57 + radius_house_num * 0.43;
  const radius_planet_zodiac =
    radius_zodiac_num * 0.36 + radius_house_num * 0.64;
  const radius_planet_minute =
    radius_zodiac_num * 0.205 + radius_house_num * 0.795;
  const radius_planet_retro = radius_house_num * 1.1;

  const short_length_pl = 0.1;
  const short_length_xtick_minor = 0.15;
  const short_length_xtick_major = 0.3;

  const linewidth_wide = 2;
  const linewidth_middle = 1;
  const linewidth_thin = 1;
  const linewidth_light = 0.3;
  const stroke = [5, 1, 1, 1]; //stroke of circles from outside to inside
  console.log(planetState);
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
          <Circle key={r} radius={r} stroke={stroke[index]} />
        )
      )}
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
          />
          <Line
            startRadius={radius_zodiac_num}
            length={2}
            theta={planetState[planet].lon}
            // color =
          />
        </React.Fragment>
      ))}
    </svg>
  );
}
function Inputs({ timeLocation, handleInputChange }) {
  return (
    <section className="grid grid-cols-3 gap-2">
      {Object.keys(timeLocation).map((param) => (
        <div key={param} className="mb-2 text-center">
          <label>{param}</label>
          <input
            className="w-full md:w-12 lg:w-12 text-center"
            type="number"
            step="any"
            value={timeLocation[param]}
            onChange={(e) => handleInputChange(param, e.target.value)}
          />
        </div>
      ))}
      {}
    </section>
  );
}
function App() {
  const inputsParameters = [
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "lonDeg",
    "lonMin",
    "lonSec",
    "latDeg",
    "latMin",
    "latSec",
  ];
  const diff = 7;
  const [helio, setHelio] = useState(false);
  const handleHelio = () => {
    setHelio(!helio);
  };
  const dateTime = useRef(DateTime.utc());
  const [timeLocation, setTimeLocation] = useState(
    Object.fromEntries(
      inputsParameters.map((param, index) => [
        param,
        index > 5 ? 0 : dateTime.current[param],
      ])
    )
  );
  const [userLocation, setUserLocation] = useState(null);
  // const handleUserLocationChange = (newLocation) => {
  //   setUserLocation(newLocation);
  // };
  const updateGeo = (newLocation) => {
    console.log("updateGeo", newLocation);

    const lat = parseDegreeNoZodiac(newLocation.latitude);
    const lon = parseDegreeNoZodiac(newLocation.longitude);
    setTimeLocation((prev) => ({
      ...prev,
      lonDeg: lon.degree,
      lonMin: lon.minute,
      lonSec: lon.second,
      latDeg: lat.degree,
      latMin: lat.minute,
      latSec: lat.second,
    }));
    console.log("updateGeo2", timeLocation);
  };
  const updatedDateTime = DateTime.utc(
    parseInt(timeLocation.year),
    parseInt(timeLocation.month),
    parseInt(timeLocation.day),
    parseInt(timeLocation.hour) || 0, // 时、分、秒等属性可以根据需要添加
    parseInt(timeLocation.minute) || 0,
    parseInt(timeLocation.second) || 0
  );
  if (updatedDateTime.isValid) {
    dateTime.current = updatedDateTime.plus({
      seconds: (timeLocation.hour % 1) * 3600,
    });
  }

  const planetState = planetsPositionsList(dateTime.current.toJSDate(), helio);
  console.log("check planets", planetState, dateTime.current);
  const planetNonCollision = avoidCollision(planetState, diff);
  const handleInputChange = (key, value) => {
    setTimeLocation((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="flex flex-col items-center">
      <p>{dateTime.current.toString()}</p>
      <button onClick={handleHelio}>
        {helio ? "Heliocentric" : "Geocentric"}
      </button>
      <GeoComp setUserLocation={setUserLocation} updateGeo={updateGeo} />
      {userLocation && (
        <div>
          <p>Latitude: {userLocation.latitude}</p>
          <p>Longitude: {userLocation.longitude}</p>
        </div>
      )}
      <Inputs
        timeLocation={timeLocation}
        handleInputChange={handleInputChange}
      />
      <Chart
        planetState={planetState}
        planetNonCollision={planetNonCollision}
      />
    </main>
  );
}

export default App;
