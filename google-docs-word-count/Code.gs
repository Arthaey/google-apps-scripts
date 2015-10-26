var g_nanowrimoLog = ""; // For debug logging across methods.

// Triggers can't return anything, so if you want to compare things between
// runs, it's ugly globar vars! :(
var g_checkGoalTrigger;
var g_updateTrigger;
var g_thisWordCount = 0;
var g_lastWordCount = 0;

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

  installCheckGoalTrigger();
  installUpdateTrigger();
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
  
  var reportCardWordCounts = updateReportCard(newWordCount);
  var newWordCount = reportCardWordCounts["new"];
  var minWordCount = reportCardWordCounts["min"];
  
  log("Total word count is now " + newWordCount + " words.");

  if (newWordCount < minWordCount) {
    var neededWordCount = minWordCount - newWordCount;
    log("Write " + neededWordCount + " more words today.");
  }

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

/*******************************************************************************/

function getInsertPoint() {
  var body = getDocument().getBody();
  var insertPointText = getInsertPointText();
  if (!insertPointText) insertPointText = "CONTINUE HERE";

  var searchResult = body.findText(insertPointText);
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

