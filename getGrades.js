// Just nav the grades page hit f-12 and paste this into the dev console
function removeZeroPointRows() {
  const allPossibleGradeSpans = [...document.querySelectorAll(".student_assignment .assignment_score .tooltip .grade+span")]
  const zeroPointSpans = allPossibleGradeSpans.filter(el => parseInt(el.textContent.replace("/", "")) === 0)
  const zeroPointRows = zeroPointSpans.map(el => el.parentElement.parentElement.parentElement.parentElement)
  zeroPointRows.forEach(row => row.remove())
}
function getGradedRows() {
  return getEditableRows().filter(rmRowsWithoutActualScore);

}
function getEditableRows() {
  return [...document.getElementsByClassName("student_assignment editable")]
}
function rmRowsWithoutActualScore(row) {
  return !Number.isNaN(getScore(row))
}
function getScore(row) {
  const grade = row.querySelector(".grade")
  if (grade.classList.contains("changed")) {
    return parseFloat(grade.textContent.trim())
  }
  return parseFloat(grade.lastChild.textContent.trim())
}
function rowToAssignmentObject(row) {
  return {
    groupType: row.querySelector("th > .context").textContent,
    actualScore: getScore(row),
    possibleScore: parseFloat(row.querySelector(" td.assignment_score div.score_holder span.tooltip >span.grade+span").innerText.replace(/^\//, "")),
  }
}
function getGroups() {
  return [...document.querySelectorAll("div#assignments-not-weighted div table.summary tbody tr")].map(el => ({ group: el.querySelector("th").textContent, weight: parseInt(el.querySelector("td").textContent.replace("%", "")) })).filter((el) => el.group != "Total");
}
function getScale(groupType) {
  return getGroups().find(el => el.group === groupType).weight;
}
console.log({ groups: getGroups(), assignments: getGradedRows().map(rowToAssignmentObject) })
function getAverage(assignments) {
  const groups = getGroups()
  const averages = groups.map(el => weightedAverageForGroup(assignments, el.group))
  return averages.reduce(toTotal, 0)
  function toTotal(total, current) {
    return total += current
  }
}
function weightedAverageForGroup(assignments, group) {
  const filteredGroup = assignments.filter(el => el.groupType === group)
  const total = filteredGroup.reduce((result, curr) => result += curr.actualScore / curr.possibleScore, 0)
  // if category has no entries set the average to one for max points
  const average = total / filteredGroup.length || 1;
  const weightedAverage = average * getScale(group)
  return weightedAverage
}
function replaceDisabledMsg() {
  const msgBox = document.querySelector("#student-grades-final");
  msgBox.innerHTML = `<s>Calculation</s>"Estimation"🤔 of totals has been enabled\n`
  const allAssignments = getGradedRows().map(rowToAssignmentObject)
  const nonDroppedAssignments = getGradedRows()
    .filter((el) => !el.classList.contains("dropped"))
    .map(rowToAssignmentObject)
  msgBox.innerHTML += `<table class="summary">
    <thead>
    <tr>
      <th scope="col">Scores</th>
      <th scope="col">Average</th>
    </tr>
    </thead>
    <tbody>
${getGroups().map(({ group }) => {
    return `<tr>
              <th scope="row">${group}</th>
              <td>${Math.floor(weightedAverageForGroup(allAssignments, group))}%</td>
            </tr>`
  }).join("")}
        <tr>
          <th scope="row">All</th>
          <td>${Math.floor(getAverage(allAssignments))}%</td>
        </tr>
        <tr>
          <th scope="row">Minus Dropped Scores</th>
          <td>${Math.floor(getAverage(nonDroppedAssignments))}%</td>
        </tr>
    </tbody>
  </table>`
}
removeZeroPointRows()
replaceDisabledMsg()
