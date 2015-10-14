function _getProperty(key) {
  var properties = PropertiesService.getScriptProperties();
  return properties.getProperty(key);
}

function _setProperty(key, value) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty(key, value);
  return value;
}

function getManualAdjustment()       { return _getProperty("MANUAL_ADJUSTMENT"); }
function setManualAdjustment(amount) { return _setProperty("MANUAL_ADJUSTMENT", amount); }

function getIgnoredHeading()        { return _getProperty("IGNORED_HEADING"); }
function setIgnoredHeading(heading) { return _setProperty("IGNORED_HEADING", heading); }

function getStoryId()   { return _getProperty("STORY_ID"); }
function setStoryId(id) { return _setProperty("STORY_ID", id); }

function getReportCardId()   { return _getProperty("REPORT_CARD_ID"); }
function setReportCardId(id) { return _setProperty("REPORT_CARD_ID", id); }

function getEmailAddress()      { return _getProperty("EMAIL_ADDRESS"); }
function setEmailAddress(email) { return _setProperty("EMAIL_ADDRESS", email); }

