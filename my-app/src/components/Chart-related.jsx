import React from "react";
import { Text, Line } from "./SVGComponents.jsx";
import { parseDegree, zodiacSymbol, colorTheme } from "../utils.js";
export function Cusps({ cusps, startRadius, length, zodiacRadius }) {
  console.log(cusps);
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
