import * as dom from "~/utils/domTools";
export default function Table() {
  const allAssignments = dom.getAllAssignments();
  const nonDroppedAssignments = dom.getNonDroppedAssignments();
  const groups = dom.getGroups();
  return (
    <>
      <s>Calculation</s>"Estimation"🤔 of totals has been enabled
      <table className="summary">
        <thead>
          <tr>
            <th scope="col">Scores</th>
            <th scope="col">Average</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ group }) => (
            <tr>
              <th scope="row">{group}</th>
              <td>
                {Math.floor(dom.weightedAverageForGroup(allAssignments, group))}
                %
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row">All</th>
            <td>{Math.floor(dom.getAverage(allAssignments))}%</td>
          </tr>
          <tr>
            <th scope="row">Minus Dropped Scores</th>
            <td>{Math.floor(dom.getAverage(nonDroppedAssignments))}%</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
