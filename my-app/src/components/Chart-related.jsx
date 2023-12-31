/* eslint-disable react/prop-types */
import React from "react";
import { Text, Line, Symbols } from "./SVGComponents.jsx";
import { parseDegree, zodiacSymbol, colorTheme } from "../utils.js";

export function Cusps({ cusps, startRadius, length, zodiacRadius }) {
  // console.log(cusps);
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
  const fontsize_ASCMC = "70%";
  const fontsize_zodiac = "75%";
  const fontsize_minute = "50%";
  const fontsize_retro = "40%";
  const element = Math.floor(resPosition.zodiac % 4);
  const color = colorTheme(element);
  console.log("planet", planet, ["Asc", "Vtx", "MC", "EP"].includes(planet));
  return (
    <>
      {["Asc", "Vtx", "MC", "EP"].includes(planet) ? (
        <Text
          text={planet}
          radius={radius_planet}
          theta={planetNonCollision}
          color={color}
          fontSize={fontsize_ASCMC}
          leftDegree={leftDegree}
          fontWeight="normal"
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
