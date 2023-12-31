/* eslint-disable react/prop-types */
// import { useState } from "react";
import { degreesToRadians } from "../utils.js";
import Form from "react-bootstrap/Form";
// import React from "react";
import Sun from "../assets/Sun.svg?react";
import Moon from "../assets/Moon.svg?react";
import Mercury from "../assets/Mercury.svg?react";
import Venus from "../assets/Venus.svg?react";
import Mars from "../assets/Mars.svg?react";
import Jupiter from "../assets/Jupiter.svg?react";
import Saturn from "../assets/Saturn.svg?react";
import Uranus from "../assets/Uranus.svg?react";
import Neptune from "../assets/Neptune.svg?react";
import Pluto from "../assets/Pluto.svg?react";
import MeanNode from "../assets/NorthNode.svg?react";
import TrueNode from "../assets/NorthNodeTrue.svg?react";
import MeanApogee from "../assets/BlackMoon.svg?react";
import Chiron from "../assets/Chiron.svg?react";
import Pholus from "../assets/Pholus.svg?react";
import Ceres from "../assets/Ceres.svg?react";
import Pallas from "../assets/Pallas.svg?react";
import Juno from "../assets/Juno.svg?react";
import Vesta from "../assets/Vesta.svg?react";

// import Vesta from "../assets/Vesta.svg?react";

function SVGFile(props) {
  switch (props.planet) {
    case "Sun":
      return <Sun {...props} />;
    case "Moon":
      return <Moon {...props} />;
    case "Mercury":
      return <Mercury {...props} />;
    case "Venus":
      return <Venus {...props} />;
    case "Mars":
      return <Mars {...props} />;
    case "Jupiter":
      return <Jupiter {...props} />;
    case "Saturn":
      return <Saturn {...props} />;
    case "Uranus":
      return <Uranus {...props} />;
    case "Neptune":
      return <Neptune {...props} />;
    case "Pluto":
      return <Pluto {...props} />;
    case "mean Node":
      return <MeanNode {...props} />;
    case "true Node":
      return <TrueNode {...props} />;
    case "mean Apogee":
      return <MeanApogee {...props} />;
    case "Chiron":
      return <Chiron {...props} />;
    // case "Pholus":
    //   return <Pholus {...props} />;
    case "Ceres":
      return <Ceres {...props} />;
    case "Pallas":
      return <Pallas {...props} />;
    case "Juno":
      return <Juno {...props} />;
    case "Pholus":
      return <Pholus {...props} />;
    case "Vesta":
      return <Vesta {...props} />;
    default:
      return props.retText(props.planet);
  }
}

export function Text({
  text,
  radius,
  theta,
  color,
  fontSize = "30",
  //   fontWeight,
  //   isPlanet,
  leftDegree = 0,
  fontWeight = "normal",
}) {
  const cos_value = Math.cos(degreesToRadians(theta - leftDegree));
  const sin_value = Math.sin(degreesToRadians(theta - leftDegree));
  return (
    <text
      x={-radius * cos_value + "%"}
      y={+radius * sin_value + "%"}
      fontFamily="Arial"
      fontSize={fontSize}
      fill={color}
      textAnchor="middle"
      alignmentBaseline="middle"
      fontWeight={fontWeight}
      stroke="white"
      paintOrder="stroke"
    >
      {text}
    </text>
  );
}
export function Symbols({
  symbolName,
  radius,
  theta,
  leftDegree = 0,
  scale = 0.1,
  color = "#000",
  sizeCanves,
}) {
  const cos_value = Math.cos(degreesToRadians(theta - leftDegree));
  const sin_value = Math.sin(degreesToRadians(theta - leftDegree));
  const x = (-radius * cos_value * sizeCanves) / 100;
  const y = (+radius * sin_value * sizeCanves) / 100;
  function retText(text) {
    return (
      <Text
        text={text == text.slice(0, 4)}
        radius={radius}
        theta={theta}
        color={color}
        leftDegree={leftDegree}
        fontSize={sizeCanves / 80}
      />
    );
  }
  return (
    <SVGFile
      planet={symbolName}
      x={-(scale * sizeCanves) / 2 + x} //in outer svg
      y={-(scale * sizeCanves) / 2 + y}
      width={`${scale * 100}%`} //in outer svg
      height={`${scale * 100}%`}
      fill={color}
      stroke={color}
      retText={retText}
    />
  );
}
export function Line({
  startRadius,
  length, // in %
  theta,
  leftDegree = 0,
  color = "black",
}) {
  const cos_value = Math.cos(degreesToRadians(theta - leftDegree));
  const sin_value = Math.sin(degreesToRadians(theta - leftDegree));
  const endRadius = startRadius - length;
  return (
    <line
      x1={-startRadius * cos_value + "%"}
      y1={+startRadius * sin_value + "%"}
      x2={-endRadius * cos_value + "%"}
      y2={+endRadius * sin_value + "%"}
      stroke={color}
    />
  );
}
export function Circle({ radius, stroke }) {
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

export function SelectDropdown({ onSelect, options }) {
  const handleSelect = (event) => {
    const selectedValue = event.target.value;
    onSelect(selectedValue); // Pass the selected value to the parent component
  };

  return (
    <Form.Select
      onChange={handleSelect}
      style={{ maxWidth: "250px" }}
      className="mb-2"
    >
      {Object.entries(options).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Form.Select>
  );
}
