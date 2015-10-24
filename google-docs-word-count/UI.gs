function alertMetGoalForToday(goal, actual) {
  var ui = DocumentApp.getUi();
  ui.alert("Congrats! Word count is " + actual + " (today's goal was " + goal + ").");
}

function _promptForProperty(msg, setFunc) {
  var ui = DocumentApp.getUi();
  var response = ui.prompt(msg);
  if (response.getSelectedButton() == ui.Button.OK) {
    var value = response.getResponseText();
    setFunc(value);
    return value;
  }
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

function displayAdjustedWordCount() {
  var wordCounts = getWordCounts();
  var toc = wordCounts["toc"];
  var ignoredHeading = getIgnoredHeading();
  
  var msg = 
    wordCounts["raw"] + ": raw word count\n" +
    "- " + wordCounts["title"] + ": title word count\n" +
    "- " + (toc * 2) + ": table of contents word count (" + toc + "x2)\n" +
    "- " + wordCounts["ignored"] + ": ignored words\n" +
    "- " + wordCounts["manual"] + ": manual adjustment\n" +
    "====================\n" +
    wordCounts["adjusted"] + ": adjusted word count"
    ;
      
  DocumentApp.getUi().alert(msg);
}

function displayUpdatedReportCard() {
  var wordCounts = updateReportCard();
  var msg;

  if (wordCounts["msg"]) {
    msg = wordCounts["msg"];
  } else {
    msg =
        wordCounts["new"] + ": new word count\n" +
      "====================\n" +
        wordCounts["min"] + ": minumum word count to win\n" +
        wordCounts["desired"] + ": desired word count\n"
        ;
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

