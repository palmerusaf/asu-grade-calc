export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason !== "install") return;

    // Open a tab on install
    await browser.tabs.create({
      url: "https://canvas.asu.edu/courses/213275/grades",
      active: true,
    });
  });
});
