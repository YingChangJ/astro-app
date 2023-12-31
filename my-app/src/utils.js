/* eslint-disable react/prop-types */
// import * as Astronomy from "./lib/astronomy.min.js";

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
export function colorTheme(element) {
  const colors = ["#cc0000", "#f1c232", "#3d85c6", "#6aa84f"];
  return colors[element];
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
  //degree1 >= degree2 if not cross 360, find the middle point, when degree2 counter-clockwise to degree1
  const middle = (degree1 + degree2) / 2;
  if (degree1 >= degree2) {
    return middle;
  } else {
    return (middle + 180) % 360;
  }
}
// function trisection(degree1, degree2) {
//   //degree1 >= degree2 if not cross 360, find the trisection points, when degree2 counter-clockwise to degree1
//   // Calculate the first and second trisection points
//   const deg1 = degree1 >= degree2 ? degree1 : degree1 + 360;
//   const trisect1 = (2 * deg1 + degree2) / 3;
//   const trisect2 = (deg1 + 2 * degree2) / 3;
//   return [trisect1 % 360, trisect2 % 360];
// }
// function distance(degree1, degree2) {
//   //degree1 >= degree2 if not cross 360, find the distance, when degree2 counter-clockwise to degree1
//   if (degree1 >= degree2) {
//     return degree1 - degree2;
//   } else {
//     return degree1 + 360 - degree2;
//   }
// }
