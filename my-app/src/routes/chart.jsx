import { useOutletContext } from "react-router-dom";
import { distance } from "../utils.js";
import { useState } from "react";

import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";
import {
  SelectDropdown,
  CheckTrueOrMean,
  CheckboxGroup,
} from "../components/SVGComponents.jsx";
import SVG from "../components/SVG.jsx";
export default function Chart() {
  const [dateTime, , location] = useOutletContext();

  //Consts
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

  //Handle funs
  function handleHelio() {
    setHelio((prev) => !prev);
  }
  function handleSidereal() {
    setSiderealOrTropical((prev) => !prev);
  }
  function handleShownPlanets(key) {
    setShownPlanets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  //Calc
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
        siderealOrTropical ? sidMode : 0,
        location.longitude,
        location.latitude,
        house,
        258 | (helio ? 8 : 0),
      ]
    )
  );
  // console.log(wasm);
  const cusps = wasm.house;
  const planetState = {};
  function planetFromWasm(key) {
    planetState[key] = {
      lon: wasm.planets[key]["lon"],
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
  if (!helio) {
    if (shownPlanets.Node) {
      planetFromWasm(nodeType + " Node");
    }
    if (shownPlanets.Lilith) {
      const nameLilith = lilithType === "mean" ? "mean Apogee" : "osc. Apogee";
      planetFromWasm(nameLilith);
    }

    const distanceASCToSun = distance(
      wasm.ascmc["Asc"],
      wasm.planets["Sun"]["lon"]
    );
    const dayOrNight = distanceASCToSun >= 0 && distanceASCToSun < 180;
    const distanceMoonToSun = distance(
      wasm.planets["Moon"]["lon"],
      wasm.planets["Sun"]["lon"]
    );
    if (shownPlanets["Ft. P."]) {
      planetState["Ft. P."] = {
        lon:
          (wasm.ascmc["Asc"] +
            (dayOrNight ? distanceMoonToSun : -distanceMoonToSun) +
            360) %
          360,
        speed: 1024,
      };
    }
    if (shownPlanets["Sp. P."]) {
      planetState["Sp. P."] = {
        lon:
          (wasm.ascmc["Asc"] +
            (dayOrNight ? -distanceMoonToSun : distanceMoonToSun) +
            360) %
          360,
        speed: 1024,
      };
    }
  } else {
    delete planetState["Sun"];
  }

  if (house === "W" || house === "E") {
    planetState["Mc"] = { lon: wasm.ascmc["MC"], speed: 1024 };
  }

  if (house === "W") {
    planetState["Asc"] = { lon: wasm.ascmc["Asc"], speed: 1024 };
  }
  if (shownPlanets["East P."]) {
    planetState["EP"] = { lon: wasm.ascmc["EP"], speed: 1024 };
  }
  if (shownPlanets["Vertex"]) {
    planetState["Vtx"] = { lon: wasm.ascmc["Vtx"], speed: 1024 };
  }

  return (
    <>
      <Accordion className="mb-2">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <Stack direction="horizontal" className="w-100">
              <Row>
                <Col>
                  <div className="d-none d-md-flex">Ayanamsa: </div>
                  <div>{sidOptions[sidMode]}</div>
                </Col>
                <Col>
                  <div className="d-none d-md-flex">House: </div>
                  <div>{houseOptions[house]}</div>
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
      <div
        className="justify-content-center d-flex text-center"
        style={{ maxWidth: "800px" }}
      >
        {/* <Row> */}
        <SVG planetState={planetState} cusps={cusps} />
        {/* </Row> */}
      </div>
    </>
  );
}
