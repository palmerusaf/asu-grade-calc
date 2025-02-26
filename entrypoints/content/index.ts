import * as dom from "@/utils/domTools";
import ReactDOM from "react-dom/client";
import Table from "./Table";

export default defineContentScript({
  matches: ["https://canvas.asu.edu/*"],
  main() {
    dom.removeZeroPointRows();
    addChangeListeners();
    replaceDisabledMsg();
  },
});
function addChangeListeners() {
  dom.getEditableRows().forEach((row) => (row.onclick = replaceDisabledMsg));
}

function replaceDisabledMsg() {
  const msgBox = document.querySelector("#student-grades-final");
  if (msgBox == null) return;
  const root = ReactDOM.createRoot(msgBox);
  root.render(Table());
}
