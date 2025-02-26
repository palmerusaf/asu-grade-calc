export function getAverage(assignments) {
  const groups = getGroups();
  const averages = groups.map((el) =>
    weightedAverageForGroup(assignments, el.group),
  );
  return averages.reduce(toTotal, 0);
  function toTotal(total, current) {
    return (total += current);
  }
}
function getGradedRows() {
  return getEditableRows().filter(rmRowsWithoutActualScore);
}
export function getEditableRows() {
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
  return {
    groupType: row.querySelector("th > .context").textContent,
    actualScore: getScore(row),
    possibleScore: parseFloat(
      row
        .querySelector(
          " td.assignment_score div.score_holder span.tooltip >span.grade+span",
        )
        .innerText.replace(/^\//, ""),
    ),
  };
}
export function getGroups() {
  return [
    ...document.querySelectorAll(
      "div#assignments-not-weighted div table.summary tbody tr",
    ),
  ]
    .map((el) => ({
      group: el.querySelector("th").textContent,
      weight: parseInt(el.querySelector("td").textContent.replace("%", "")),
    }))
    .filter((el) => el.group != "Total");
}
function getScale(groupType) {
  return getGroups().find((el) => el.group === groupType).weight;
}
export function weightedAverageForGroup(assignments, group) {
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
export const getAllAssignments = () =>
  getGradedRows().map(rowToAssignmentObject);
export const getNonDroppedAssignments = () =>
  getGradedRows()
    .filter((el) => !el.classList.contains("dropped"))
    .map(rowToAssignmentObject);

export function removeZeroPointRows() {
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
}
