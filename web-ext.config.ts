import { defineRunnerConfig } from "wxt";

export default defineRunnerConfig({
  chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
});
