/**
 * --------------------------------------------------------------------------
 * zero-impression-cleaner - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, LOOKBACK_WINDOW: "LAST_30_DAYS", LABEL_NAME: "Paused_Zero_Impression" };
function main() {
  Logger.log("Démarrage de Zero Impression Cleaner...");
  if (!CONFIG.TEST_MODE) createLabelIfNeeded(CONFIG.LABEL_NAME);
  var kwIter = AdsApp.keywords().withCondition("Status = ENABLED").withCondition("CampaignStatus = ENABLED").withCondition("AdGroupStatus = ENABLED").withCondition("Impressions = 0").forDateRange(CONFIG.LOOKBACK_WINDOW).get();
  var count = 0;
  while(kwIter.hasNext()) {
    var kw = kwIter.next();
    if (!CONFIG.TEST_MODE) { kw.applyLabel(CONFIG.LABEL_NAME); kw.pause(); }
    count++;
  }
  Logger.log(count + " mots-clés mis en pause.");
}
function createLabelIfNeeded(name) {
  if (!AdsApp.labels().withCondition("Name = '" + name + "'").get().hasNext()) { AdsApp.createLabel(name); }
}
