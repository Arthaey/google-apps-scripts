function _getProperty(key) {
  var properties = PropertiesService.getScriptProperties();
  return properties.getProperty(key);
}

function _setProperty(key, value) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty(key, value);
  return value;
}

function getManualAdjustment()    { return _getProperty("MANUAL_ADJUSTMENT"); }
function setManualAdjustment(val) { return _setProperty("MANUAL_ADJUSTMENT", val); }

function getIgnoredHeading()      { return _getProperty("IGNORED_HEADING"); }
function setIgnoredHeading(val)   { return _setProperty("IGNORED_HEADING", val); }

function getStoryId()             { return _getProperty("STORY_ID"); }
function setStoryId(val)          { return _setProperty("STORY_ID", val); }

function getReportCardId()        { return _getProperty("REPORT_CARD_ID"); }
function setReportCardId(id)      { return _setProperty("REPORT_CARD_ID", val); }

function getEmailAddress()        { return _getProperty("EMAIL_ADDRESS"); }
function setEmailAddress(val)     { return _setProperty("EMAIL_ADDRESS", val); }

