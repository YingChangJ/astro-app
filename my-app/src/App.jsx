/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useRef, useMemo, useEffect, useMatches } from "react";
import { Link, Outlet } from "react-router-dom";
import React from "react";
import "./App.css";
import { parseDegreeNoZodiac, distance } from "./utils.js";
import GeoComp from "./components/Geo.jsx";
import { DateTime } from "./lib/luxon.min.js";
import {
  SelectDropdown,
  CheckTrueOrMean,
  CheckboxGroup,
} from "./components/SVGComponents.jsx";
import { Button, Stack } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";

function Inputs({ inputs, handleInputsChange }) {
  // const renderInputsInRows = (inputs, handleChange) => {
  //   const inputRows = [];
  //   let currentRow = [];

  //     // Check if it's the third input in the row or the last input
  //     if ((index + 1) % 3 === 0 || index === Object.keys(inputs).length - 1) {
  //       inputRows.push(<Row key={index}>{currentRow}</Row>);
  //       currentRow = [];
  //     }
  //   });

  //   return inputRows;
  // };
  return (
    <Row className="w-100 d-flex">
      {Object.keys(inputs).map((param, index) => (
        <Col md={2} key={param}>
          <Form.Label>{param}</Form.Label>
          <Form.Control
            className="text-center"
            type="number"
            step="any"
            inputMode="numeric" // Specifies that the input should only accept numeric values
            value={inputs[param]}
            onChange={(e) => handleInputsChange(param, e.target.value)}
          />
        </Col>
      ))}
    </Row>
  );
}
function formatLocation(location) {
  const ew = location.longitude >= 0 ? "E" : "W";
  const ns = location.latitude >= 0 ? "N" : "S";
  return `${Math.abs(location.longitude).toFixed(4)} ${ew} ${Math.abs(
    location.latitude
  ).toFixed(4)} ${ns}`;
}
function App() {
  // useEffect(() => {
  //   // 在组件挂载后等待三秒钟
  //   const timeoutId = setTimeout(() => {
  //     // 这里的代码在等待三秒钟后执行
  //     console.log("After waiting for three seconds");

  //     // ...其他逻辑
  //   }, 3000);

  //   return () => {
  //     // 在组件卸载时清除定时器
  //     clearTimeout(timeoutId);
  //   };
  // }, []); // 注意空数组表示只在组件挂载时执行一次
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
  // data
  const [wasm, setWasm] = useState(null);

  const [helio, setHelio] = useState(false);
  const [siderealOrTropical, setSiderealOrTropical] = useState(false); //false: tropical, true: sidereal
  //settings
  const [sidMode, setSidMode] = useState(1); //swe_set_sid_mode
  const [house, setHouse] = useState("P"); //swe_house_ex
  const [nodeType, setNodeType] = useState("mean"); //"mean", "true"
  const [lilithType, setLilithType] = useState("mean"); //"mean", "true"
  const [shownPlanets, setShownPlanets] = useState({
    // Sun: true,
    // Moon: true,
    // Mercury: true,
    // Venus: true,
    // Mars: true,
    // Jupiter: true,
    // Saturn: true,
    // Uranus: true,
    // Neptune: true,
    // Pluto: true,
    Ceres: false,
    Pallas: false,
    Juno: false,
    Vesta: false,
    Chiron: true,
    Pholus: false,
    Node: true,
    Lilith: true,
    // Asc: true,
    // MC: true,
    Vertex: false,
    "East P.": false,
    "Ft. P.": true,
    "Sp. P.": false,
  });
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
  function handleTimeInputChange(key, value) {
    timeInputs.current = { ...timeInputs.current, [key]: value };
    const offsetInMinutes = (parseFloat(timeInputs.current.offset) || 0) * 60;

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
      if (yearToCheck >= 1200 && yearToCheck <= 2400) {
        isOver1800.current = true;
      } else {
        isOver1800.current = false;
      }
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
  function handleShownPlanets(key) {
    setShownPlanets((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  console.log(shownPlanets);
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
  // const iflag = 258 | (helio ? 8 : 0);
  // console.log("flag", iflag);
  // console.log("sidMode", sidMode);
  function HandleWasm() {
    setWasm(
      JSON.parse(
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
            258 | (helio ? 8 : 0),
          ]
        )
      )
    );
  }
  if (!wasm) {
    return <Button onClick={HandleWasm}>Calculate</Button>;
  }
  const paramLon = siderealOrTropical ? "lon_sid" : "lon";
  console.log(wasm);
  const cusps = Object.values(wasm.house).map((item) => item[paramLon]);
  const planetState = {};
  function planetFromWasm(key) {
    planetState[key] = {
      lon: wasm.planets[key][paramLon],
      speed: wasm.planets[key]["speed"],
    };
  }
  [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ].forEach((planet) => {
    planetFromWasm(planet);
  });
  ["Ceres", "Pallas", "Juno", "Vesta", "Chiron", "Pholus"].forEach((planet) => {
    if (shownPlanets[planet]) {
      planetFromWasm(planet);
    }
  });
  if (shownPlanets.Node) {
    planetFromWasm(nodeType + " Node");
  }
  console.log("shownPlanets.Lilith", shownPlanets.Lilith);
  if (shownPlanets.Lilith) {
    const nameLilith = lilithType === "mean" ? "mean Apogee" : "osc. Apogee";
    planetFromWasm(nameLilith);
  }

  if (house === "W" || house === "E") {
    planetState["Mc"] = { lon: wasm.ascmc["MC"][paramLon], speed: 1024 };
  }

  if (house === "W") {
    planetState["Asc"] = { lon: wasm.ascmc["Asc"][paramLon], speed: 1024 };
  }
  if (shownPlanets["East P."]) {
    planetState["EP"] = { lon: wasm.ascmc["EP"][paramLon], speed: 1024 };
  }
  if (shownPlanets["Vertex"]) {
    planetState["Vtx"] = { lon: wasm.ascmc["Vtx"][paramLon], speed: 1024 };
  }
  const distanceASCToSun = distance(
    wasm.ascmc["Asc"][paramLon],
    wasm.planets["Sun"][paramLon]
  );
  const dayOrNight = distanceASCToSun >= 0 && distanceASCToSun < 180;
  const distanceMoonToSun = distance(
    wasm.planets["Moon"][paramLon],
    wasm.planets["Sun"][paramLon]
  );
  if (shownPlanets["Ft. P."]) {
    planetState["Ft. P."] = {
      lon:
        (wasm.ascmc["Asc"][paramLon] +
          (dayOrNight ? distanceMoonToSun : -distanceMoonToSun) +
          360) %
        360,
      speed: 1024,
    };
  }
  console.log(
    wasm.ascmc["Asc"][paramLon],
    dayOrNight ? distanceMoonToSun : -distanceMoonToSun
  );

  if (shownPlanets["Sp. P."]) {
    planetState["Sp. P."] = {
      lon:
        (wasm.ascmc["Asc"][paramLon] +
          (dayOrNight ? -distanceMoonToSun : distanceMoonToSun) +
          360) %
        360,
      speed: 1024,
    };
  }
  // console.log("hey!", planetState["Sp. P."].lon, planetState["Ft. P."].lon);
  // Use useMatch to get information about the matched route
  // const match = useMatches();
  // console.log(match[1].pathname);
  console.log("state", planetState);
  return (
    <Container className="d-flex flex-column align-items-center w-100">
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
      <Button onClick={HandleWasm}>Calculate</Button>
      <Accordion className="mb-2">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <Stack direction="horizontal" className="w-100">
              <Row>
                <Col>{dateTime.toFormat("EEE, yyyy, LLL dd HH:mm:ss ZZ")}</Col>
                <Col>
                  <div className="d-none d-md-inline">Julian Date(ut): </div>
                  {wasm.initDate.jd_ut.toFixed(4)}
                </Col>
                <Col>
                  <div className="d-none d-md-flex">Lon/Lat: </div>
                  {formatLocation(location)}
                </Col>
              </Row>
              <Row className="ms-auto">
                <Col>
                  <GeoComp updateGeo={updateGeo} />
                </Col>
                <Col>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop the event from propagating
                      updateTime();
                    }}
                    // style={{ width: "155px" }}
                  >
                    Now
                  </Button>
                </Col>
              </Row>
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
              <Button size="sm" onClick={clearInputs} className="mt-2">
                Clear
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <Stack direction="horizontal" className="w-100">
              <Row>
                <Col>
                  <div className="d-none d-md-inline">Sidereal Mode: </div>
                  {sidOptions[sidMode]}
                </Col>
                <Col>
                  <div className="d-none d-md-inline">House: </div>
                  {houseOptions[house]}
                </Col>
              </Row>
              <Row className="ms-auto">
                <Col>
                  <Button
                    size="sm"
                    className="mb-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop the event from propagating
                      handleHelio();
                    }}
                    // style={{ width: "150px" }}
                  >
                    {helio ? "Helio" : "Geo"}
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop the event from propagating
                      handleSidereal();
                    }}
                    // style={{ width: "150px" }}
                  >
                    {siderealOrTropical ? "Sid" : "Trop"}
                  </Button>
                </Col>
              </Row>
            </Stack>
          </Accordion.Header>
          <Accordion.Body as={Container}>
            <Row className="mb-3 text-start me-auto">
              <Col>
                <Row>
                  <SelectDropdown onSelect={setSidMode} options={sidOptions} />
                </Row>
                <Row>
                  <SelectDropdown onSelect={setHouse} options={houseOptions} />
                </Row>
              </Col>
              <Col>
                <Row className="fw-bold">Node:</Row>
                <CheckTrueOrMean option={nodeType} onToggle={setNodeType} />
              </Col>
              <Col>
                <Row className="fw-bold">Lilith:</Row>
                <CheckTrueOrMean option={lilithType} onToggle={setLilithType} />
              </Col>
            </Row>

            <Col>
              <CheckboxGroup
                options={shownPlanets}
                onToggle={handleShownPlanets}
              />
            </Col>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <Outlet context={[planetState, cusps]} />
      <Form.Control type="datetime-local" />
      <Form.Control type="date" />
    </Container>
  );
}

export default App;
