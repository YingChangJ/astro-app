// if these two group cover 360 deg
if (groups[index][1] < groups[nextIndex][1]) {
  //if they collide
  if (
    groups[index][1] + groups[index][2] + diff >
    groups[nextIndex][1] - groups[nextIndex][2]
  ) {
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
} else {
  if (
    groups[index][1] + groups[index][2] + diff >
    groups[nextIndex][1] + 360 - groups[nextIndex][2]
  ) {
    groups[index][0] = groups[index][0].concat(groups[nextIndex][0]);
    groups[index][1] = middle(
      degrees[groups[index][0][groups[index][0].length - 1]],
      degrees[groups[index][0][0]]
    );
    groups[index][2] = ((groups[index][0].length - 1) * diff) / 2;
    groups.splice(nextIndex, 1);
    flag = false;
  } else {
    index++;
  }
}
