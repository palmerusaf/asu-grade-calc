import * as data from "@/utils/getGrades";

export default defineContentScript({
  matches: ["https://canvas.asu.edu/*"],
  main() {
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
    }
    function getEditableRows() {
      return [
        ...document.getElementsByClassName("student_assignment editable"),
      ];
    }
    function replaceDisabledMsg() {
      const msgBox = document.querySelector("#student-grades-final");
      msgBox.innerHTML = `<s>Calculation</s>"Estimation"🤔 of totals has been enabled\n`;
      const allAssignments = data.getAllAssignments();
      const nonDroppedAssignments = data.getNonDroppedAssignments();
      msgBox.innerHTML += `<table class="summary">
    <thead>
    <tr>
      <th scope="col">Scores</th>
      <th scope="col">Average</th>
    </tr>
    </thead>
    <tbody>
${data
          .getGroups()
          .map(({ group }) => {
            return `<tr>
              <th scope="row">${group}</th>
              <td>${Math.floor(data.weightedAverageForGroup(allAssignments, group))}%</td>
            </tr>`;
          })
          .join("")}
        <tr>
          <th scope="row">All</th>
          <td>${Math.floor(data.getAverage(allAssignments))}%</td>
        </tr>
        <tr>
          <th scope="row">Minus Dropped Scores</th>
          <td>${Math.floor(data.getAverage(nonDroppedAssignments))}%</td>
        </tr>
    </tbody>
  </table>`;
    }
    // recalc score when you click to edit score
    function addChangeListeners() {
      getEditableRows().forEach((row) => (row.onclick = replaceDisabledMsg));
    }
    removeZeroPointRows();
    addChangeListeners();
    replaceDisabledMsg();
    console.log("Success now view screen where the disabled msg was.");
  },
});
