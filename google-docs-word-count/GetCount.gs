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
  wordCounts["headings"] = getHeadingsWordCount(body);
  wordCounts["insert"] = 0;
  wordCounts["ignored"] = getIgnoredWordCount(body);
  wordCounts["manual"] = Math.ceil(getManualAdjustment());

  if (insertPoint) {
    wordCounts["insert"] += getWordCount(insertPoint.getText());
    // Don't double-count bracketed text.
    wordCounts["insert"] -= getBracketedWordCount(insertPoint.getText());
  }
  
  // Remove DOUBLE the number of words in the table of contents,
  // because the headers must show up somewhere in the text itself too.  
  wordCounts["adjusted"] = wordCounts["raw"]
    - wordCounts["title"]
    - wordCounts["headings"]
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

function getHeadingsWordCount(body) {
  var wordCount = 0;
  var searchResult = null;

  while (searchResult = body.findElement(DocumentApp.ElementType.PARAGRAPH, searchResult)) {
    var elem = searchResult.getElement().asParagraph();
    if (elem.getHeading() != DocumentApp.ParagraphHeading.NORMAL) {
      wordCount += getWordCount(elem.getText());
    }
  }

  return wordCount;
}

function getIgnoredWordCount(body) {
  var wordCount = 0;
  var ignoredHeading = getIgnoredHeading();
  var text = body.getText();
  if (!text) return 0;

  wordCount += getBracketedWordCount(text);

  // If no "IGNORE PAST HERE" type heading defined in user properties, then we're done.
  if (!ignoredHeading) return wordCount;
  
  var firstElement = null;
  var heading = null;
  var searchResult = null;
  
  // findText didn't seem to work with non-ASCII?
  while (searchResult = body.findElement(DocumentApp.ElementType.PARAGRAPH, searchResult)) {
    var par = searchResult.getElement().asParagraph();
    if (!firstElement) {
      firstElement = par;
    }
    if (ignoredHeading === par.getText()) {
      heading = par;
    }
  }
  // If no "IGNORE PAST HERE" type heading found in the doc, then we're done.
  if (!heading) return wordCount;
  
  wordCount += getWordCount(heading.getText());
  wordCount -= getBracketedWordCount(heading.getText());
  var elem = heading;
  
  do {
    // Don't count headings, which are already included in the headings word count.
    elem = elem.getNextSibling();
    var elemText = elem.getText();
    if (elem.getHeading() == DocumentApp.ParagraphHeading.NORMAL) {
      wordCount += getWordCount(elemText);
    }
    // Don't double-count bracketed text.
    wordCount -= getBracketedWordCount(elemText);
  } while (!elem.isAtDocumentEnd());
  
  return wordCount;
}

function getWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function getBracketedWordCount(text) {
  var wordCount = 0;
  var bracketRegex = /\[([^\[\]]+?)\]/g;
  var matches = text.match(bracketRegex);
  if (!matches) return 0;

  for (var i = 0; i < matches.length; i++) {
    wordCount += getWordCount(matches[i]);
  }
  return wordCount;
}

