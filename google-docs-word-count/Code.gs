var g_log = ""; // For debug logging across methods.

var g_checkGoalTrigger;
var g_updateTrigger;

function onInstall(e) {
  setIgnoredHeading("");
  setManualAdjustment(0);
  setStoryId(DocumentApp.getActiveDocument().getId());
  setEmailAddress(Session.getActiveUser().getEmail());
  onOpen(e);
}

function onOpen(e) {
  var nanowrimoEnabled = getEnableNanowrimo(false);
  var reportCardEnabled = getEnableReportCard(false);

  var menu = DocumentApp.getUi().createAddonMenu();

  menu.addItem("Show adjusted word count", "displayAdjustedWordCount");
  if (nanowrimoEnabled) {
    menu.addItem("Update Record Card spreadsheet", "displayUpdatedReportCard");
  }
  menu.addSeparator();

  menu.addItem("Ignore beyond a certain heading", "promptForIgnoredHeading");
  menu.addItem("Manually adjust word count", "promptForManualAdjustment");
  menu.addSeparator();

  menu.addItem("Set story document", "promptForStoryId");
  if (reportCardEnabled) {
    menu.addItem("Set report card spreadsheet", "promptForReportCardId");
  }
  menu.addItem("Set log email address", "promptForEmailAddress");
  if (nanowrimoEnabled) {
    menu.addItem("Set NaNoWriMo username", "promptForNanowrimoUsername");
    menu.addItem("Set NaNoWriMo API secret key", "promptForNanowrimoSecretKey");
  }
  menu.addSeparator();

  // TODO: add conditional UI for toggling NaNoWriMo & Report Card features.

  menu.addToUi();

  if (nanowrimoEnabled || reportCardEnabled) {
    installCheckGoalTrigger();
    installUpdateTrigger();
  }
}

function doPost(e) {
  if (!e) return;
  
  log("Run at " + new Date().toString() + "\nwith parameters: " + JSON.stringify(e.parameter));

  var oldWordCount = getAdjustedWordCount();
  var snippet = e.parameter["snippet"];
  if (!snippet) {
    log("No snippet found to add. Total is still " + oldWordCount + " words");
    return ContentService.createTextOutput(g_log);
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
    insertHtml("<p>" + text.trim() + "</p>");
  }
  
  var reportCardWordCounts = updateReportCard(newWordCount);
  var newWordCount = reportCardWordCounts["new"];
  var minWordCount = reportCardWordCounts["min"];
  
  log("Total word count is now " + newWordCount + " words.");

  if (newWordCount < minWordCount) {
    var neededWordCount = minWordCount - newWordCount;
    log("Write " + neededWordCount + " more words today.");
  }

  if (getEnableNanowrimo(false)) {
    updateNanowrimoWordCount(newWordCount);
  }

  email(g_log);
  return ContentService.createTextOutput(g_log);
}

/*******************************************************************************/

// ONLY supports bold and italic, single-nested in paragraph tags.
function insertHtml(html, insertPoint) {
  var xml = XmlService.parse("<root>" + html + "</root>");
  var root = xml.getRootElement();
  var paragraphs = root.getChildren();
  var body = getDocument().getBody();
  var insertPointIndex = getInsertPointIndex(insertPoint);
  var indent = getIndentSize();

  var styles = {};
  styles[DocumentApp.Attribute.BACKGROUND_COLOR] = "#EAD1DC"; // identify added text easily
  styles[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.JUSTIFY;
  styles[DocumentApp.Attribute.INDENT_FIRST_LINE] = indent;

  for (var i = 0; i < paragraphs.length; i++) {
    var para = body.insertParagraph(insertPointIndex, "");
    var elems = paragraphs[i].getAllContent();

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
    
    para.setAttributes(styles);
    insertPointIndex++; // keep inserting AFTER the latest paragraph
  }

  // extra, blank paragraph as a separator
  body.insertParagraph(insertPointIndex, "");
}

/*******************************************************************************/

function getInsertPoint() {
  var body = getDocument().getBody();
  var insertPointText = getInsertPointText();
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

function getIndentSize() {
  var body = getDocument().getBody();
  var result = null;

  while (result = body.findElement(DocumentApp.ElementType.PARAGRAPH, result)) {
   var para = result.getElement().asParagraph();
   var isToc = (para.getParent().getType() == DocumentApp.ElementType.TABLE_OF_CONTENTS);
   if (!isToc && para.getIndentFirstLine() > 0) {
     log("Indent of first paragraph: " + para.getIndentFirstLine());
     return para.getIndentFirstLine();
   }
 }
  
  return 0;
}

function findParentParagraph(elem) {
  while (elem.getType() != DocumentApp.ElementType.PARAGRAPH &&
         elem.getType() != DocumentApp.ElementType.DOCUMENT) {
    elem = elem.getParent();
  }
  return elem;
}

function getActiveDocumentId() {
  var doc = DocumentApp.getActiveDocument();
  return doc ? doc.getId() : null;
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

function getActiveUserEmail() {
  return Session.getActiveUser().getEmail();
}

function getActiveUserName() {
  var email = getActiveUserEmail();
  var matches = email.match(/([^@]+)@/);
  if (matches && matches[1]) {
    return matches[1];
  }
  return null;
}

function log(msg) {
  Logger.log(msg);
  g_log += msg + "\n";
}

function email(msg) {
  var email = getEmailAddress();
  if (!email) email = promptForEmailAddress();
  GmailApp.sendEmail(email, "LiveScribe doPost log", msg);
}

