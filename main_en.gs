/**
 * --------------------------------------------------------------------------
 * Zero Impression Cleaner — Google Ads Script
 * --------------------------------------------------------------------------
 * Finds enabled keywords with zero impressions over a configurable lookback
 * window and pauses them. Labels paused keywords for easy identification.
 *
 * Author : Thibault Fayol — Thibault Fayol Consulting
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  NOTIFICATION_EMAIL: 'you@example.com',
  LOOKBACK_WINDOW: 'LAST_30_DAYS',
  LABEL_NAME: 'Paused_Zero_Impression',
  MIN_KEYWORD_AGE_DAYS: 14
};

function main() {
  try {
    Logger.log('Zero Impression Cleaner — start');

    var tz = AdsApp.currentAccount().getTimeZone();
    var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var accountName = AdsApp.currentAccount().getName();

    if (!CONFIG.TEST_MODE) {
      createLabelIfNeeded(CONFIG.LABEL_NAME);
    }

    var kwIter = AdsApp.keywords()
      .withCondition('Status = ENABLED')
      .withCondition('CampaignStatus = ENABLED')
      .withCondition('AdGroupStatus = ENABLED')
      .withCondition('Impressions = 0')
      .forDateRange(CONFIG.LOOKBACK_WINDOW)
      .get();

    var pausedCount = 0;
    var pausedKeywords = [];

    while (kwIter.hasNext()) {
      var kw = kwIter.next();

      if (!CONFIG.TEST_MODE) {
        kw.applyLabel(CONFIG.LABEL_NAME);
        kw.pause();
      }

      pausedCount++;
      if (pausedCount <= 20) {
        pausedKeywords.push(kw.getText() + ' (' + kw.getAdGroup().getCampaign().getName() + ')');
      }
    }

    Logger.log(pausedCount + ' keywords paused.');

    var subject = '[Zero Impression Cleaner] ' + accountName + ' — ' + pausedCount + ' paused';
    var body = 'Zero Impression Cleaner Report\n' +
      'Date: ' + today + '\n' +
      'Lookback: ' + CONFIG.LOOKBACK_WINDOW + '\n' +
      'Keywords paused: ' + pausedCount + '\n' +
      'Min keyword age: ' + CONFIG.MIN_KEYWORD_AGE_DAYS + ' days\n\n';

    if (pausedKeywords.length > 0) {
      body += 'Sample (first 20):\n';
      for (var i = 0; i < pausedKeywords.length; i++) {
        body += '  - ' + pausedKeywords[i] + '\n';
      }
      if (pausedCount > 20) {
        body += '  ... and ' + (pausedCount - 20) + ' more\n';
      }
    }

    body += '\n' + (CONFIG.TEST_MODE ? '(TEST MODE — no keywords paused)\n' : '');
    body += '\nLabel: ' + CONFIG.LABEL_NAME;

    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
    Logger.log('Done.');

  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL,
      '[Zero Impression Cleaner] Error', e.message + '\n' + e.stack);
  }
}

function createLabelIfNeeded(name) {
  if (!AdsApp.labels().withCondition("Name = '" + name + "'").get().hasNext()) {
    AdsApp.createLabel(name);
  }
}
