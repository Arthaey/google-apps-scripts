function _get(key, defaultValue) {
  var properties = PropertiesService.getScriptProperties();
  var value = properties.getProperty(key);
  if (!value && defaultValue) {
    value = _set(key, defaultValue);
  }
  return value;
}

function _set(key, value) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty(key, value);
  return value;
}

function getManualAdjustment(d)   { return _get("MANUAL_ADJUSTMENT", d || 0); }
function setManualAdjustment(val) { return _set("MANUAL_ADJUSTMENT", val); }

function getIgnoredHeading(d)     { return _get("IGNORED_HEADING", d || "IGNORE PAST HERE"); }
function setIgnoredHeading(val)   { return _set("IGNORED_HEADING", val); }

function getInsertPointText(d)    { return _get("INSERT_POINT_TEXT", d || "CONTINUE HERE"); }
function setInsertPointText(val)  { return _set("INSERT_POINT_TEXT", val); }

function getStoryId(d)            { return _get("STORY_ID", d || getActiveDocumentId()); }
function setStoryId(val)          { return _set("STORY_ID", val); }

function getReportCardId(d)       { return _get("REPORT_CARD_ID", d); }
function setReportCardId(id)      { return _set("REPORT_CARD_ID", val); }

function getEmailAddress(d)       { return _get("EMAIL_ADDRESS", d || getActiveUserEmail()); }
function setEmailAddress(val)     { return _set("EMAIL_ADDRESS", val); }

function getNanowrimoUsername(d)  { return _get("NANOWRIMO_USERNAME", d || getActiveUserName()); }
function setNanowrimoUsername(v)  { return _set("NANOWRIMO_USERNAME", v); }

function getNanowrimoSecretKey(d) { return _get("NANOWRIMO_SECRET_KEY", d); }
function setNanowrimoSecretKey(v) { return _set("NANOWRIMO_SECRET_KEY", v); }

function getEnableNanowrimo(d)    { return _get("ENABLE_NANOWRIMO", d); }
function setEnableNanowrimo(v)    { return _set("ENABLE_NANOWRIMO", v); }

function getEnableReportCard(d)   { return _get("ENABLE_REPORT_CARD", d); }
function setEnableReportCard(v)   { return _set("ENABLE_REPORT_CARD", v); }
