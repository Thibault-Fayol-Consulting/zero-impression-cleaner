/**
 * --------------------------------------------------------------------------
 * Nettoyeur Zero Impression — Script Google Ads
 * --------------------------------------------------------------------------
 * Identifie les mots-cles actifs avec zero impression sur une periode
 * configurable et les met en pause. Labelise pour suivi.
 *
 * Auteur : Thibault Fayol — Thibault Fayol Consulting
 * Site   : https://thibaultfayol.com
 * Licence: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  NOTIFICATION_EMAIL: 'vous@exemple.com',
  LOOKBACK_WINDOW: 'LAST_30_DAYS',
  LABEL_NAME: 'Pause_Zero_Impression',
  MIN_KEYWORD_AGE_DAYS: 14
};

function main() {
  try {
    Logger.log('Nettoyeur Zero Impression — demarrage');

    var tz = AdsApp.currentAccount().getTimeZone();
    var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var accountName = AdsApp.currentAccount().getName();

    if (!CONFIG.TEST_MODE) { createLabelIfNeeded(CONFIG.LABEL_NAME); }

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
      if (!CONFIG.TEST_MODE) { kw.applyLabel(CONFIG.LABEL_NAME); kw.pause(); }
      pausedCount++;
      if (pausedCount <= 20) {
        pausedKeywords.push(kw.getText() + ' (' + kw.getAdGroup().getCampaign().getName() + ')');
      }
    }

    Logger.log(pausedCount + ' mots-cles mis en pause.');

    var subject = '[Zero Impression] ' + accountName + ' — ' + pausedCount + ' en pause';
    var body = 'Rapport Nettoyeur Zero Impression\nDate : ' + today +
      '\nPeriode : ' + CONFIG.LOOKBACK_WINDOW +
      '\nMots-cles mis en pause : ' + pausedCount +
      '\nAge minimum : ' + CONFIG.MIN_KEYWORD_AGE_DAYS + ' jours\n\n';

    if (pausedKeywords.length > 0) {
      body += 'Echantillon (20 premiers) :\n';
      for (var i = 0; i < pausedKeywords.length; i++) {
        body += '  - ' + pausedKeywords[i] + '\n';
      }
      if (pausedCount > 20) { body += '  ... et ' + (pausedCount - 20) + ' de plus\n'; }
    }

    body += '\n' + (CONFIG.TEST_MODE ? '(MODE TEST)\n' : '');
    body += '\nLabel : ' + CONFIG.LABEL_NAME;

    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
    Logger.log('Termine.');

  } catch (e) {
    Logger.log('ERREUR : ' + e.message);
    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL,
      '[Zero Impression] Erreur', e.message + '\n' + e.stack);
  }
}

function createLabelIfNeeded(name) {
  if (!AdsApp.labels().withCondition("Name = '" + name + "'").get().hasNext()) {
    AdsApp.createLabel(name);
  }
}
