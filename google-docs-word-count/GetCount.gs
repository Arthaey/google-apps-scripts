function getAdjustedWordCount() {
  return getWordCounts()["adjusted"];
}

function getWordCounts() {
  var body = getDocument().getBody();
  var wordCounts = {};
  var insertPoint = getInsertPoint();
  
  wordCounts["raw"] = getWordCount(body.getText());
  wordCounts["title"] = getTitleWordCount(body);
  wordCounts["toc"] = getTableOfContentsWordCount(body);
  wordCounts["insert"] = getWordCount(insertPoint ? insertPoint.getText() : 0);
  wordCounts["ignored"] = getIgnoredWordCount(body);
  wordCounts["manual"] = Math.ceil(getManualAdjustment());
  
  // Remove DOUBLE the number of words in the table of contents,
  // because the headers must show up somewhere in the text itself too.  
  wordCounts["adjusted"] = wordCounts["raw"]
    - wordCounts["title"]
    - wordCounts["toc"] * 2
    - wordCounts["insert"]
    - wordCounts["ignored"]
    - wordCounts["manual"]
    ;
  
  return wordCounts;
}

function getTitleWordCount(body) {
  var searchResult = null;
  while (searchResult = body.findElement(DocumentApp.ElementType.PARAGRAPH, searchResult)) {
    var par = searchResult.getElement().asParagraph();
    if (par.getHeading() == DocumentApp.ParagraphHeading.TITLE) {
      return getWordCount(par.getText());
    }
  }
  return 0;
}

function getTableOfContentsWordCount(body) {
  var tocResult = body.findElement(DocumentApp.ElementType.TABLE_OF_CONTENTS);
  if (!tocResult) return 0;
  
  var toc = tocResult.getElement().asTableOfContents();
  return getWordCount(toc.getText());
}

function getIgnoredWordCount(body) {
  var ignoredHeading = getIgnoredHeading();
  if (!ignoredHeading) return 0;
  
  var body = getDocument().getBody();
  var heading = null;
  var searchResult = null;
  
  // findText didn't seem to work with non-ASCII?
  while (searchResult = body.findElement(DocumentApp.ElementType.PARAGRAPH, searchResult)) {
    var par = searchResult.getElement().asParagraph();
    if (ignoredHeading === par.getText()) {
      heading = par;
    }
  }
  if (!heading) return 0;
  
  var wordCount = getWordCount(heading.getText());
  var elem = heading;
  
  do {
    // Don't count headings, which are already included in the TOC word count.
    elem = elem.getNextSibling();
    if (elem.getHeading() == DocumentApp.ParagraphHeading.NORMAL) {
      wordCount += getWordCount(elem.getText());
    }
  } while (!elem.isAtDocumentEnd());
  
  return wordCount;
}

function getWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

