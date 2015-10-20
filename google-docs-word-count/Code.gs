var g_nanowrimoLog = ""; // For debug logging across methods.

function onInstall(e) {
  setIgnoredHeading("");
  setManualAdjustment(0);
  setStoryId(DocumentApp.getActiveDocument().getId());
  setEmailAddress(Session.getActiveUser().getEmail());
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
    .addItem("Show adjusted word count", "displayAdjustedWordCount")
    .addItem("Update Record Card spreadsheet", "displayUpdatedReportCard")
    //.addItem("Update Camp NaNoWriMo word count", "displayUpdatedCampNaNoWriMo")
    .addSeparator()
    .addItem("Ignore beyond a certain heading", "promptForIgnoredHeading")
    .addItem("Manually adjust word count", "promptForManualAdjustment")
    .addSeparator()
    .addItem("Set story document", "promptForStoryId")
    .addItem("Set report card spreadsheet", "promptForReportCardId")
    .addItem("Set log email address", "promptForEmailAddress")
    .addToUi();
}

function doPost(e) {
  if (!e) return;
  
  log("Run at " + new Date().toString() + "\nwith parameters: " + JSON.stringify(e.parameter));

  var oldWordCount = getAdjustedWordCount();
  var snippet = e.parameter["snippet"];
  if (!snippet) {
    log("No snippet found to add. Total is still " + oldWordCount + " words");
    return ContentService.createTextOutput(g_nanowrimoLog);
  }
    
  var snippetWordCount = getWordCount(snippet);
  var newWordCount = oldWordCount + snippetWordCount;
  
  var body = getDocument().getBody();  
  var insertPoint = getInsertPoint();
  
  var isHtml = (e.parameters["is_html"] == 1);
  log((isHtml ? "HTML" : "Plain text") + " snippet received.");
  log("Snippet is " + snippetWordCount + " words.");

  if (e.parameters["is_html"] == 1) {
    insertHtml(snippet, insertPoint);
  } else {
    insertText(snippet, insertPoint);
  }
  
  updateReportCard(newWordCount);
  
  log("Total word count is now " + newWordCount + " words.");
  email(g_nanowrimoLog);
  
  return ContentService.createTextOutput(g_nanowrimoLog);
}

/*******************************************************************************/

// ONLY supports bold and italic, single-nested in paragraph tags.
function insertHtml(html, insertPoint) {
  var xml = XmlService.parse("<root>" + html + "</root>");
  var root = xml.getRootElement();
  var paragraphs = root.getChildren();
  var body = getDocument().getBody();
  var insertPointIndex = getInsertPointIndex(insertPoint);
  var indent = insertPoint.getPreviousSibling().getIndentFirstLine();
  
  for (var i = 0; i < paragraphs.length; i++) {
    var para = body.insertParagraph(insertPointIndex, "");
    var elems = paragraphs[i].getAllContent();
    para.setIndentFirstLine(indent);
    
    for (var j = 0; j < elems.length; j++) {
      var elem = elems[j];
      var text = para.appendText(elem.getValue());
      var isBold = false;
      var isItalic = false;

      if (elem.getType() == XmlService.ContentTypes.ELEMENT) {
        var tagName = elem.getName().toLowerCase();
        isBold   = (tagName === "b" || tagName === "strong");
        isItalic = (tagName === "i" || tagName === "em");
      }

      text.setBold(isBold);
      text.setItalic(isItalic);
    }
    
    insertPointIndex++; // keep inserting AFTER the latest paragraph
  }
}

function insertText(text, insertPoint) {
  var body = getDocument().getBody();
  var insertPointIndex = getInsertPointIndex(insertPoint);
  body.insertParagraph(insertPointIndex, text.trim() + "\n");
}

function updateReportCard(newWordCount) {
  log("\n\nUPDATING REPORT CARD SPREADSHEET...\n\n");
  if (!newWordCount) newWordCount = getAdjustedWordCount();
  
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Report Card");
  
  var startDate = sheet.getRange("A9").getValue();
  var now = new Date();
  log("Start date: " + startDate);
  log("Current date: " + now);
  if (startDate > now) {
    return { "msg": "Writing challenge does not start until " + startDate };
  }
  
  var whenIsItTomorrow = 6; // 6 AM is the deadline, in my book
  var cutoff = new Date(now);
  cutoff.setHours(whenIsItTomorrow);
  cutoff.setMinutes(0);
  cutoff.setSeconds(0);
  cutoff.setMilliseconds(0);
  if (now.getHours() >= whenIsItTomorrow) {
    cutoff.setDate(cutoff.getDate() + 1);
  }
  log("Cutoff date: " + cutoff);
  
  var dates = sheet.getRange("A9:A38").getValues();
  var todaysDateRow = 9;
  for (var i = 0; i < dates.length; i++) {
    if (dates[i][0] <= now) {
      todaysDateRow = 9 + i;
    }
  }

  var dateCell = sheet.getRange("A" + todaysDateRow);
  var countCell = sheet.getRange("B" + todaysDateRow);
  var minCountCell = sheet.getRange("P" + todaysDateRow);
  var desiredCountCell = sheet.getRange("Q" + todaysDateRow);
  
  log("Setting cell B" + todaysDateRow + " (corresponding to " + (new Date(dateCell.getValue())) + ").");
  countCell.setValue(newWordCount);
  
  var wordCounts = {
    "new": newWordCount,
    "min": Math.round(minCountCell.getValue()),
    "desired": Math.round(desiredCountCell.getValue())
  };
  
  log(wordCounts["min"] + ": minimum word count to win\n" +
      wordCounts["desired"] + ": desired word count\n");

  return wordCounts;
}

/*******************************************************************************/

function getInsertPoint() {
  var body = getDocument().getBody();
  var searchResult = body.findText("INSERT POINT");
  if (!searchResult) return null;

  var elem = searchResult.getElement();
  return findParentParagraph(elem);
}

function getInsertPointIndex(insertPoint) {
  if (!insertPoint) insertPoint = getInsertPoint();
  var body = getDocument().getBody();
  return (insertPoint ? body.getChildIndex(insertPoint) : body.getNumChildren() - 1);
}

function findParentParagraph(elem) {
  while (elem.getType() != DocumentApp.ElementType.PARAGRAPH &&
         elem.getType() != DocumentApp.ElementType.DOCUMENT) {
    elem = elem.getParent();
  }
  return elem;
}

function getDocument() {
  var storyId = getStoryId();
  if (!storyId) storyId = promptForStoryId();
  return DocumentApp.openById(storyId);
}

function getSpreadsheet() {
  var reportCardId = getReportCardId();
  if (!reportCardId) reportCardId = promptForReportCardId();
  return SpreadsheetApp.openById(reportCardId);
}

function log(msg) {
  Logger.log(msg);
  g_nanowrimoLog += msg + "\n";
}

function email(msg) {
  var email = getEmailAddress();
  if (!email) email = promptForEmailAddress();
  GmailApp.sendEmail(email, "NaNoWriMo doPost log", msg);
}

