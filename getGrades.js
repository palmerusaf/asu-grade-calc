// Just nav the grades page hit f-12 and paste this into the dev console
function removeZeroPointRows() {
  const allPossibleGradeSpans = [
    ...document.querySelectorAll(
      ".student_assignment .assignment_score .tooltip .grade+span",
    ),
  ];
  const zeroPointSpans = allPossibleGradeSpans.filter(
    (el) => parseInt(el.textContent.replace("/", "")) === 0,
  );
  const zeroPointRows = zeroPointSpans.map(
    (el) => el.parentElement.parentElement.parentElement.parentElement,
  );
  zeroPointRows.forEach((row) => row.remove());
  allPossibleGradeSpans.forEach((el) => {
    const par = el.parentElement.parentElement.parentElement.parentElement;
    if (par.textContent.includes("Practice")) {
      par.remove();
    }
  });
}
function fixFinalExamCatGroup() {
  getEditableRows().forEach((el) => {
    const title = el.querySelector("th").querySelector("a").innerText;
    const cat = el.querySelector("th").querySelector("div");
    if (title.includes("Final")) {
      cat.innerText = "Final";
    }
  });
}
function getGradedRows() {
  return getEditableRows().filter(rmRowsWithoutActualScore);
}
function getEditableRows() {
  return [...document.getElementsByClassName("student_assignment editable")];
}
function rmRowsWithoutActualScore(row) {
  return !Number.isNaN(getScore(row));
}
function getScore(row) {
  const grade = row.querySelector(".grade");
  if (grade.classList.contains("changed")) {
    return parseFloat(grade.textContent.trim());
  }
  return parseFloat(grade.lastChild.textContent.trim());
}
function rowToAssignmentObject(row) {
  let possibleScore = parseFloat(
    row
      .querySelector(
        " td.assignment_score div.score_holder span.tooltip >span.grade+span",
      )
      .innerText.replace(/^\//, ""),
  );
  possibleScore = Number.isNaN(possibleScore) ? 100 : possibleScore;
  const actualScore = Number.isNaN(getScore(row))
    ? possibleScore
    : getScore(row);
  return {
    groupType: row.querySelector("th > .context").textContent,
    actualScore,
    possibleScore,
  };
}
function getGroups() {
  return [
    { group: "Homework", weight: 15 },
    { group: "Lectures", weight: 15 },
    { group: "Quizzes", weight: 10 },
    { group: "Project", weight: 5 },
    { group: "Exams", weight: 18 * 2 },
    { group: "Final", weight: 19 },
    // { group: "Exams",    weight: 15*2 },
    // { group: "Final",    weight: 25 },
  ];
}
function getScale(groupType) {
  return getGroups().find((el) => el.group === groupType).weight;
}
function getAverage(assignments) {
  const groups = getGroups();
  const averages = groups.map((el) =>
    weightedAverageForGroup(assignments, el.group),
  );
  return averages.reduce(toTotal, 0);
  function toTotal(total, current) {
    return (total += current);
  }
}
function weightedAverageForGroup(assignments, group) {
  const filteredGroup = assignments.filter((el) => el.groupType === group);
  const total = filteredGroup.reduce(
    (result, curr) => (result += curr.actualScore / curr.possibleScore),
    0,
  );
  // if category has no entries set the average to one for max points
  const average = filteredGroup.length === 0 ? 1 : total / filteredGroup.length;
  const weightedAverage = average * getScale(group);
  return weightedAverage;
}
function replaceDisabledMsg() {
  const msgBox = document.querySelector("#student-grades-final");
  msgBox.innerHTML = `<s>Calculation</s>"Estimation"🤔 of totals has been enabled\n`;
  const allAssignments = getGradedRows().map(rowToAssignmentObject);
  const nonDroppedAssignments = getGradedRows()
    .filter((el) => !el.classList.contains("dropped"))
    .map(rowToAssignmentObject);
  msgBox.innerHTML += `<table class="summary">
    <thead>
    <tr>
      <th scope="col">Scores</th>
      <th scope="col">Average</th>
    </tr>
    </thead>
    <tbody>
${getGroups()
  .map(({ group }) => {
    return `<tr>
              <th scope="row">${group}</th>
              <td>${Math.floor(
                weightedAverageForGroup(allAssignments, group),
              )}%</td>
            </tr>`;
  })
  .join("")}
        <tr>
          <th scope="row">All</th>
          <td>${Math.floor(getAverage(allAssignments))}%</td>
        </tr>
        <tr>
          <th scope="row">Minus Dropped Scores</th>
          <td>${Math.floor(getAverage(nonDroppedAssignments))}%</td>
        </tr>
    </tbody>
  </table>`;
}
// recalc score when you click to edit score
function addChangeListeners() {
  getEditableRows().forEach((row) => (row.onclick = replaceDisabledMsg));
}
removeZeroPointRows();
fixFinalExamCatGroup();
addChangeListeners();
replaceDisabledMsg();
console.log("Success now view screen where the disabled msg was.");
console.log("uncomment weights in getGroups method to try alt weights");
