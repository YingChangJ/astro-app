/* eslint-disable react/prop-types */
import React from "react";
import { Text, Line, Symbols } from "./SVGComponents.jsx";
import { parseDegree, zodiacSymbol, colorTheme } from "../utils.js";

export function Cusps({ cusps, startRadius, length, zodiacRadius }) {
  const strokeWidth_ASCMC = "4px";
  const strokeWidth_notASCMC = "1px";
  const generateLines = () => {
    const cuspsElement = [];
    for (let i = 0; i < 12; i++) {
      const cuspPosition = parseDegree(cusps[i]);
      const cuspElement = (
        <React.Fragment key={`cusp_${i}`}>
          <Line
            startRadius={startRadius}
            length={length}
            theta={cusps[i]}
            leftDegree={cusps[0]}
            strokeWidth={i % 3 === 0 ? strokeWidth_ASCMC : strokeWidth_notASCMC}
          />
          <Text
            text={cuspPosition.degree}
            radius={zodiacRadius}
            theta={cusps[i] + 5}
            leftDegree={cusps[0]}
            fontSize="75%"
            fontWeight="bold"
          />
          <Text
            text={zodiacSymbol(cuspPosition.zodiac)}
            radius={zodiacRadius}
            theta={cusps[i]}
            leftDegree={cusps[0]}
            color={colorTheme(cuspPosition.zodiac % 4)}
            fontSize="75%"
          />
          <Text
            text={cuspPosition.minute}
            radius={zodiacRadius}
            theta={cusps[i] - 5}
            leftDegree={cusps[0]}
            fontSize="50%"
          />
        </React.Fragment>
      );
      cuspsElement.push(cuspElement);
    }
    return cuspsElement;
  };
  return generateLines();
}
export function Planet({
  planet, //"Sun", "MC", etc
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
  const fontsize_ASCMC = "65%";
  const fontsize_zodiac = "75%";
  const fontsize_minute = "50%";
  const fontsize_retro = "40%";
  const element = Math.floor(resPosition.zodiac % 4);
  const color = colorTheme(element);
  const textPlanet = {
    Asc: "Asc",
    Vtx: "Vx",
    MC: "MC",
    EP: "EP",
    "Ft. P.": "⊗",
    "Sp. P.": "SP",
  };
  return (
    <>
      {Object.keys(textPlanet).includes(planet) ? (
        <Text
          text={textPlanet[planet]}
          radius={radius_planet}
          theta={planetNonCollision}
          color={color}
          fontSize={fontsize_ASCMC}
          leftDegree={leftDegree}
          fontWeight="bold"
        />
      ) : (
        <Symbols
          symbolName={planet}
          radius={radius_planet}
          theta={planetNonCollision}
          scale={0.04}
          sizeCanves={sizeCanvas}
          color={color}
          leftDegree={leftDegree}
        />
      )}
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
          text={"℞"}
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
