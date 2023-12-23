/* eslint-disable react/prop-types */
import * as Astronomy from "./lib/astronomy.min.js";
export function planetsPositionsList(date, helio = false) {
  const planetsName = [
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
  ];

  const list = {};

  planetsName.forEach((planet) => {
    const temp = planetsPositions(planet, date, helio);
    list[planet] = {
      lon: temp.positionECTSphere.elon,
      direction: temp.lonPerSecond,
    };
  });

  return list;
}
function planetsPositions(body, date, helio = false) {
  const astroTime = new Astronomy.AstroTime(date);
  const astroTimeAddSecond = astroTime.AddDays(1 / 86400);
  console.log("cal");
  let stateVectorEQJ = null,
    stateVectorEQJAddSecond = null;
  if (helio) {
    stateVectorEQJ = Astronomy.BaryState(body, astroTime); //EQJ //HelioState for accelerating frame of reference; BaryState for non-accelerating
    stateVectorEQJAddSecond = Astronomy.BaryState(body, astroTimeAddSecond);
  } else {
    stateVectorEQJ = Astronomy.GeoVector(body, astroTime, true);
    stateVectorEQJAddSecond = Astronomy.GeoVector(
      body,
      astroTimeAddSecond,
      true
    );
  }

  const positionECTSphere = Astronomy.Ecliptic(stateVectorEQJ);
  const positionECTSphereAddSecond = Astronomy.Ecliptic(
    stateVectorEQJAddSecond
  );
  const lonPerSecond = positionECTSphereAddSecond.elon - positionECTSphere.elon;
  return {
    positionECTSphere: positionECTSphere,
    lonPerSecond: lonPerSecond,
  };
}

export function parseDegree(deg) {
  const zodiac = Math.floor(deg / 30);
  const remainder = deg % 30;
  const degree = Math.floor(remainder);
  const minute = Math.floor((remainder - degree) * 60);
  return { zodiac: zodiac, degree: degree, minute: minute };
}
export function parseDegreeNoZodiac(deg) {
  const degree = Math.floor(deg);
  const minute = Math.floor((deg - degree) * 60);
  const second = Math.round(((deg - degree) * 60 - minute) * 60);
  return { degree: degree, minute: minute, second: second };
}
export function degreesToRadians(degree) {
  return degree * (Math.PI / 180);
}
export function zodiacSymbol(zodiac) {
  return String.fromCharCode(zodiac + 9800) + "\u{FE0E}";
}
export function avoidCollision(degreesList, diff = 5) {
  //flatten
  const degrees = Object.fromEntries(
    Object.entries(degreesList).map(([key, value]) => [key, value.lon])
  );
  const keys = Object.keys(degrees);
  const groups = keys.map((planet) => [[planet], degrees[planet], 0]); // group element, center, radius
  groups.sort((a, b) => a[1] - b[1]);
  for (let _ = 0; _ < 10; _++) {
    // could be while (true)
    let flag = true;
    let index = 0;
    while (index < groups.length) {
      const groupsLength = groups.length;
      const nextIndex = (index + 1) % groupsLength;
      // if these two group cover 360 deg
      const boolOver360 = groups[index][1] < groups[nextIndex][1];
      //if they collide
      const boolMerge =
        groups[index][1] + groups[index][2] + diff >
        groups[nextIndex][1] - groups[nextIndex][2] + (boolOver360 ? 0 : 360);
      if (boolMerge) {
        //merge the two group
        groups[index][0] = groups[index][0].concat(groups[nextIndex][0]);
        groups[index][1] = middle(
          degrees[groups[index][0][groups[index][0].length - 1]],
          degrees[groups[index][0][0]]
        );
        groups[index][2] = ((groups[index][0].length - 1) * diff) / 2;
        groups.splice(nextIndex, 1); //delete the second
        flag = false;
      } else {
        index++;
      }
    }
    if (flag) {
      break;
    }
  }
  groups.forEach((group) => {
    const n = group[0].length;
    if (n === 1) {
      return;
    }
    const middle = group[1];
    group[0].forEach((planet, index) => {
      degrees[planet] = (middle - group[2] + diff * index) % 360;
    });
  });
  return degrees;
}

function middle(degree1, degree2) {
  //deg1 >= deg2, find the middle point deg2 counter-clockwise to deg1
  let middle = (degree1 + degree2) / 2;
  if (degree1 < degree2) {
    middle = (middle + 180) % 360;
  }
  return middle;
}
