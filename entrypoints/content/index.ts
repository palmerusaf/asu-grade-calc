import * as dom from "@/utils/domTools";

export default defineContentScript({
  matches: ["https://canvas.asu.edu/*"],
  main() {
    // Just nav the grades page hit f-12 and paste this into the dev console
    function replaceDisabledMsg() {
      const msgBox = document.querySelector("#student-grades-final");
      msgBox.innerHTML = Table().innerHTML;
    }
    // recalc score when you click to edit score
    function addChangeListeners() {
      dom
        .getEditableRows()
        .forEach((row) => (row.onclick = replaceDisabledMsg));
    }
    dom.removeZeroPointRows();
    addChangeListeners();
    replaceDisabledMsg();
    console.log("Success now view screen where the disabled msg was.");
  },
});
function Table() {
  const res = document.createElement("div");
  res.innerHTML = `<s>Calculation</s>"Estimation"🤔 of totals has been enabled\n`;
  const allAssignments = dom.getAllAssignments();
  const nonDroppedAssignments = dom.getNonDroppedAssignments();
  const groups = dom.getGroups();
  res.innerHTML += `<table class="summary">
    <thead>
    <tr>
      <th scope="col">Scores</th>
      <th scope="col">Average</th>
    </tr>
    </thead>
    <tbody>
${groups
      .map(({ group }) => {
        return `<tr>
              <th scope="row">${group}</th>
              <td>${Math.floor(dom.weightedAverageForGroup(allAssignments, group))}%</td>
            </tr>`;
      })
      .join("")}
        <tr>
          <th scope="row">All</th>
          <td>${Math.floor(dom.getAverage(allAssignments))}%</td>
        </tr>
        <tr>
          <th scope="row">Minus Dropped Scores</th>
          <td>${Math.floor(dom.getAverage(nonDroppedAssignments))}%</td>
        </tr>
    </tbody>
  </table>`;
  return res;
}
