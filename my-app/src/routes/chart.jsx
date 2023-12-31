import { useOutletContext } from "react-router-dom";
import React from "react";
import { avoidCollision } from "../utils.js";
import { Line, Circle } from "../components/SVGComponents.jsx";
import { Planet, Cusps } from "../components/Chart-related.jsx";
export default function Chart() {
  const [planetState, cusps] = useOutletContext();
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
  // const short_length_pl = 0.1;
  // const short_length_xtick_minor = 0.15;
  // const short_length_xtick_major = 0.3;

  // const linewidth_wide = 2;
  // const linewidth_middle = 1;
  // const linewidth_thin = 1;
  // const linewidth_light = 0.3;
  const stroke = [5, 1, 1, 1]; //stroke of circles from outside to inside
  const diff = 7; //avoid planets overlapped in chart
  const planetNonCollision = avoidCollision(planetState, diff);
  console.log("cusps", cusps);
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
            planet={planet} //"Sun", "MC", etc.
            lon={planetState[planet].lon}
            direction={planetState[planet].speed < 0}
            radius_planet={radius_planet}
            radius_planet_degree={radius_planet_degree}
            radius_planet_zodiac={radius_planet_zodiac}
            radius_planet_minute={radius_planet_minute}
            radius_planet_retro={radius_planet_retro}
            sizeCanvas={svgWidth}
            planetNonCollision={planetNonCollision[planet]}
            leftDegree={cusps[1]}
          />
          <Line
            startRadius={radius_zodiac}
            length={2}
            theta={planetState[planet].lon}
            leftDegree={cusps[1]}
          />
        </React.Fragment>
      ))}
    </svg>
  );
}
