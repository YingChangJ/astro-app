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
  houses,
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
  leftDegree,
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
        leftDegree={leftDegree}
      />
      <Text
        text={resPosition.degree}
        radius={radius_planet_degree}
        theta={planetNonCollision}
        // color="black"
        fontSize={fontsize_degree}
        leftDegree={leftDegree}
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
            leftDegree={cusps[0]}
          />
          <Line
            startRadius={radius_zodiac_num}
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
    <section className="grid grid-cols-3 gap-2">
      {renderInput(timeInputs, handleTimeInputsChange)}
      {renderInput(locationInputs, handleLocationInputsChange)}
    </section>
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
  const [forceRender, setForceRender] = useState(false);

  //Handle funs
  const handleHelio = () => {
    setHelio(!helio);
  };
  const handleTimeInputChange = (key, value) => {
    timeInputs.current = { ...timeInputs.current, [key]: value };
    //Calculates
    const updatedDateTime = DateTime.utc(
      parseInt(timeInputs.current.year),
      parseInt(timeInputs.current.month),
      parseInt(timeInputs.current.day),
      parseInt(timeInputs.current.hour) || 0, // 时、分、秒等属性可以根据需要添加
      parseInt(timeInputs.current.minute) || 0,
      parseInt(timeInputs.current.second) || 0
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
    const trimAndParse = (deg, min, sec) =>
      parseFloat(deg.trim()) +
      parseFloat(min.trim()) / 60 +
      parseFloat(sec.trim()) / 3600;
    const longitude = trimAndParse(lonDeg, lonMin, lonSec);
    const latitude = trimAndParse(latDeg, latMin, latSec);
    if (!isNaN(longitude) && !isNaN(latitude)) {
      setLocation({ longitude, latitude });
    } else {
      triggerRerender();
    }
  };
  const triggerRerender = () => {
    setForceRender((prev) => !prev);
  };

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
      <GeoComp updateGeo={updateGeo} />

      {/* <div>
        <p>{cusps[0]}</p>
      </div> */}

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
