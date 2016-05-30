function formatWithCommas(num) {
  num = num.toString();
  while (/(\d+)(\d{3})/.test(num)){
    num = num.replace(/(\d+)(\d{3})/, "$1" + "," + "$2");
  }
  return num;
}

function updateWordCountDisplay(wordCount) {
  var body = getDocument().getBody();

  var now = new Date();
  var timezone = -(now.getTimezoneOffset() / 60);
  var timezoneStr = "GMT" + (timezone < 0 ? "" : "+") + timezone;
  var nowStr = Utilities.formatDate(now, timezoneStr, "E yyyy-MM-dd h:mm a");

  if (!wordCount) wordCount = getAdjustedWordCount();
  wordCount = formatWithCommas(wordCount);

  var wordCountText = "[" + wordCount + " WORDS, LAST UPDATED " + nowStr + "]";

  var wordCountParagraph;
  var range = body.findText("\\[[0-9,]+ WORDS, LAST UPDATED .+?\\]");
  if (range) {
    wordCountParagraph = range.getElement().asText();
    wordCountParagraph.setText(wordCountText);
  } else {
    wordCountParagraph = body.insertParagraph(0, wordCountText);
  }
  wordCountParagraph.setForegroundColor("#b7b7b7"); // dark gray 1
}

function alertMetGoalForToday(goal, actual) {
  goal = formatWithCommas(goal);
  actual = formatWithCommas(actual);
  withUi(function(ui) {
    ui.alert("Congrats! Word count is " + actual + " (today's goal was " + goal + ").");
  });
}

function _promptForProperty(msg, setFunc) {
  withUi(function(ui) {
    var response = ui.prompt(msg);
    if (response.getSelectedButton() == ui.Button.OK) {
      var value = response.getResponseText();
      setFunc(value);
      return value;
    }
  });
}

function promptForIgnoredHeading() {
  _promptForProperty("Ignore beyond this paragraph text:", setIgnoredHeading);
}

function promptForManualAdjustment() {
  _promptForProperty("Number of words to subtract from raw count):", setManualAdjustment);
}

function promptForStoryId() {
  _promptForProperty("ID for story document:", setStoryId);
}

function promptForReportCardId() {
  _promptForProperty("ID for report card spreadsheet:", setReportCardId);
}

function promptForEmailAddress() {
  _promptForProperty("Email address to send logs:", setEmailAddress);
}

function promptForNanowrimoUsername() {
  _promptForProperty("NaNoWriMo username:", setNanowrimoUsername);
}

function promptForNanowrimoSecretKey() {
  _promptForProperty("NaNoWriMo secret key — see http://nanowrimo.org/api/wordcount", setNanowrimoSecretKey);
}

function displayAdjustedWordCount() {
  var wordCounts = getWordCounts();
  var toc = wordCounts["toc"];
  var ignoredHeading = getIgnoredHeading();

  var msg = 
    formatWithCommas(wordCounts["raw"]) + ": raw word count\n" +
    "- " + formatWithCommas(wordCounts["title"]) + ": title word count\n" +
    "- " + formatWithCommas(toc * 2) + ": table of contents word count " +
    "(" + formatWithCommas(toc) + "x2)\n" +
    "- " + formatWithCommas(wordCounts["ignored"]) + ": ignored words\n" +
    "- " + formatWithCommas(wordCounts["manual"]) + ": manual adjustment\n" +
    "====================\n" +
    formatWithCommas(wordCounts["adjusted"]) + ": adjusted word count"
    ;

  updateWordCountDisplay(wordCounts["adjusted"]);
  DocumentApp.getUi().alert(msg);
}

function displayUpdatedReportCard() {
  var wordCounts = updateReportCard();
  var msg;

  if (wordCounts["msg"]) {
    msg = wordCounts["msg"];
  } else {
    msg =
        formatWithCommas(wordCounts["new"]) + ": new word count\n" +
        formatWithCommas(wordCounts["min"]) + ": minumum word count to win on time\n";

    if (wordCounts["min"] != wordCounts["desired"]) {
      msg += formatWithCommas(wordCounts["desired"]) + ": desired word count\n";
    }

    var diff = wordCounts["min"] - wordCounts["new"];
    msg += "====================\n" +
        formatWithCommas(diff) + ": write at least this much more today!\n";
  }

  updateWordCountDisplay(wordCounts["new"]);

  if (getEnableNanowrimo(false)) {
    var nanoResponse = updateNanowrimoWordCount(wordCounts["new"]);
    msg += nanoResponse;
  }

  DocumentApp.getUi().alert(msg);
}

/*
function displayUpdatedCampNaNoWriMo(wordCount) {
  if (!wordCount) wordCount = getAdjustedWordCount();
  var msg = updateCampNaNoWriMo(wordCount);
  DocumentApp.getUi().alert(msg);
}
*/

function withUi(func) {
  if (!DocumentApp) return;
  var doc = getDocument();
  if (!doc) return;
  var ui = DocumentApp.getUi();
  if (!ui) return;

  func(ui);
}

