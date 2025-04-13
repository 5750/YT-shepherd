browser.runtime.onInstalled.addListener(async () => {
  let settings = await browser.storage.local.get(["InspireList", "NeutralList", "AvoidList"]);
  if (!settings.InspireList) await browser.storage.local.set({ InspireList: [] });
  if (!settings.NeutralList) await browser.storage.local.set({ NeutralList: [] });
  if (!settings.AvoidList)   await browser.storage.local.set({ AvoidList:   [] });
});