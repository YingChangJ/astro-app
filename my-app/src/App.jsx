/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useMatches } from "react-router-dom";
import React from "react";
import "./App.css";
import { planetsPositionsList, parseDegreeNoZodiac, houses } from "./utils.js";
import GeoComp from "./components/Geo.jsx";
import { DateTime } from "./lib/luxon.min.js";
import { SelectDropdown } from "./components/SVGComponents.jsx";
import { Button, Stack } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
function Inputs({ inputs, handleInputsChange }) {
  const renderInputsInRows = (inputs, handleChange) => {
    const inputRows = [];
    let currentRow = [];

    Object.keys(inputs).forEach((param, index) => {
      currentRow.push(
        <Col xs md={4}>
          <Form.Label>{param}</Form.Label>
          <Form.Control
            className="text-center"
            type="number"
            step="any"
            inputMode="numeric" // Specifies that the input should only accept numeric values
            value={inputs[param]}
            onChange={(e) => handleChange(param, e.target.value)}
          />
        </Col>
      );

      // Check if it's the third input in the row or the last input
      if ((index + 1) % 3 === 0 || index === Object.keys(inputs).length - 1) {
        inputRows.push(<Row key={index}>{currentRow}</Row>);
        currentRow = [];
      }
    });

    return inputRows;
  };
  return (
    <Container fluid>
      {renderInputsInRows(inputs, handleInputsChange)}
    </Container>
  );
}
function formatLocation(location) {
  const ew = location.longitude >= 0 ? "E" : "W";
  const ns = location.latitude >= 0 ? "N" : "S";
  return `Longitude: ${Math.abs(location.longitude).toFixed(
    4
  )} ${ew} Latitude: ${Math.abs(location.latitude).toFixed(4)} ${ns}`;
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
  const sidOptions = {
    0: "Fagan/Bradley",
    1: "Lahiri",
    27: "True Citra",
    3: "Raman",
    7: "Yukteshwar",
    30: "Galactic Center (Gil Brand)",
    29: "True Pushya (PVRN Rao)",
  };
  const houseOptions = {
    P: "Placidus",
    K: "Koch",
    B: "Alcabitus",
    E: "Equal",
    W: "Whole sign",
    R: "Regiomontanus",
    C: "Campanus",
  };

  //Hooks
  const [helio, setHelio] = useState(false);
  const [siderealOrTropical, setSiderealOrTropical] = useState(false); //false: tropical, true: sidereal
  //settings
  const [sidMode, setSidMode] = useState(1); //swe_set_sid_mode
  const [house, setHouse] = useState("P");
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
    setHelio((prev) => !prev);
  }
  function handleSidereal() {
    setSiderealOrTropical((prev) => !prev);
  }
  // function handleSidMode(sidNumber) {
  //   setSidMode(sidNumber);
  // }
  function handleTimeInputChange(key, value) {
    timeInputs.current = { ...timeInputs.current, [key]: value };
    const offsetInMinutes = (parseFloat(timeInputs.current.offset) || 0) * 60;
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
      (parseFloat(lonDeg) || 0) +
      (parseFloat(lonMin) || 0) / 60 +
      (parseFloat(lonSec) || 0) / 3600;
    const latitude =
      (parseFloat(latDeg) || 0) +
      (parseFloat(latMin) || 0) / 60 +
      (parseFloat(latSec) || 0) / 3600;
    setLocation({ longitude, latitude });
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
  const iflag = 258 | (helio ? 8 : 0);
  // console.log("flag", iflag);
  // console.log("sidMode", sidMode);

  const wasmResult = window.Module.ccall(
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
      sidMode,
      location.longitude,
      location.latitude,
      house,
      iflag,
    ]
  );
  console.log("house", house);
  const wasm = JSON.parse(wasmResult);
  const paramLong = siderealOrTropical ? "long_sid" : "long";
  let planetState,
    cusps = undefined;
  if (isOver1800.current) {
    console.log(wasmResult);

    cusps = wasm.house.map((item) => item[paramLong]);
    planetState = wasm.planets.reduce((result, item) => {
      if (
        item.name !== "intp. Apogee" &&
        item.name !== "intp. Perigee" &&
        item.name !== "osc. Apogee"
      ) {
        result[item.name] = { lon: item[paramLong], speed: item.speed };
      }
      return result;
    }, {});
  } else {
    const paraLongDiff = siderealOrTropical ? wasm.ayan : 0;
    // console.log("ayan", paraLongDiff);
    //{Sun:{lon:1,speed:2},Moon:{lon:2,speed:3},...}
    planetState = planetsPositionsList(dateTime.toJSDate(), helio);
    Object.entries(planetState).forEach(([planet]) => {
      planetState[planet].lon =
        (planetState[planet].lon - paraLongDiff + 360) % 360;
    });
    cusps = houses(
      dateTime.toJSDate(),
      location.longitude,
      location.latitude
    ).map((cuspDegree) => (cuspDegree - paraLongDiff + 360) % 360);
  }
  if (house === "W" || house === "E") {
    planetState["MC"] = { lon: wasm.ascmc[1][paramLong], speed: 10000000 };
  }
  console.log(wasm.ascmc[0], paramLong);
  if (house === "W") {
    planetState["ASC"] = { lon: wasm.ascmc[0][paramLong], speed: 10000000 };
  }
  // Use useMatch to get information about the matched route
  const match = useMatches();
  console.log(match[1].pathname);
  console.log(
    dateTime.toLocaleString({
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    }),
    formatLocation(location),
    house,
    sidMode
  );
  return (
    <Container className="d-flex flex-column align-items-center">
      <Col className="d-flex mb-2">
        <Link to="/" className="mx-3">
          Chart
        </Link>
        <Link to="vedic" className="mx-3">
          Vedic
        </Link>
        <Link to="bazi" className="mx-3">
          Bazi
        </Link>
      </Col>
      <Accordion className="mb-2">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <Stack direction="horizontal" gap={2} className="w-100">
              <Row>
                <div>
                  {dateTime.toLocaleString({
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    timeZoneName: "short",
                  })}
                </div>
                <div>{formatLocation(location)}</div>
              </Row>
              <Stack direction="horizontal" gap={2} className="ms-auto me-2">
                <GeoComp updateGeo={updateGeo} />
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event from propagating
                    updateTime();
                  }}
                  style={{ width: "155px" }}
                >
                  Get Time
                </Button>
              </Stack>
            </Stack>
          </Accordion.Header>
          <Accordion.Body>
            <div>
              <Inputs
                inputs={timeInputs.current}
                handleInputsChange={handleTimeInputChange}
              />
              <Inputs
                inputs={locationInputs.current}
                handleInputsChange={handleLocationInputChange}
              />
              <Button onClick={clearInputs} className="mt-2">
                Clear
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <Stack direction="horizontal" className="w-100">
              <Row xs="auto">
                <Col>Sidereal Mode: {sidOptions[sidMode]}</Col>
                <Col>House: {houseOptions[house]}</Col>
              </Row>
              {/* <Row className="md-4">
              <div>
                {dateTime.toLocaleString({
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                  timeZoneName: "short",
                })}
              </div>
              <div>{formatLocation(location)}</div>
            </Row> */}
              <Stack direction="horizontal" gap={2} className="ms-auto me-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event from propagating
                    handleHelio();
                  }}
                  style={{ width: "155px" }}
                >
                  {helio ? "Heliocentric" : "Geocentric"}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event from propagating
                    handleSidereal();
                  }}
                  style={{ width: "155px" }}
                >
                  {siderealOrTropical ? "Sidereal" : "Tropical"}
                </Button>
              </Stack>
            </Stack>
          </Accordion.Header>
          <Accordion.Body>
            <Stack direction="horizontal" gap={3} className="mx-auto">
              <SelectDropdown onSelect={setSidMode} options={sidOptions} />
              <SelectDropdown onSelect={setHouse} options={houseOptions} />
            </Stack>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Outlet context={[planetState, cusps]} />
      {/* <script type="module" src="/astro.js"></script> */}
    </Container>
  );
}

export default App;
