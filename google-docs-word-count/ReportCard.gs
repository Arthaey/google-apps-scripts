function updateReportCard(newWordCount) {
  log("\n\nUPDATING REPORT CARD SPREADSHEET...\n\n");

  var story = getDocument();
  if (!story) {
    log("ABANDONING BECAUSE STORY DOCUMENT NOT FOUND: " + getStoryId());
    return {};
  }

  var spreadsheet = getSpreadsheet();
  if (!spreadsheet) {
    log("ABANDONING BECAUSE REPORT CARD SPREADSHEET NOT FOUND: " + getReportCardId());
    return {};
  }

  if (!newWordCount) newWordCount = getAdjustedWordCount();

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

  var todaysDateRow = getTodaysDateRow(sheet, now);
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

function getTodaysDateRow(sheet, now) {
  if (!now) now = new Date();

  var dates = sheet.getRange("A9:A38").getValues();
  var todaysDateRow = 9;
  for (var i = 0; i < dates.length; i++) {
    if (dates[i][0] <= now) {
      todaysDateRow = 9 + i - 1;
    }
  }

  return todaysDateRow;
}

function getGoalForToday(now) {
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Report Card");
  var todaysDateRow = getTodaysDateRow(sheet, now);
  var minCountCell = sheet.getRange("P" + todaysDateRow);
  var desiredCountCell = sheet.getRange("Q" + todaysDateRow);
  var min = Math.round(minCountCell.getValue());
  var desired = Math.round(desiredCountCell.getValue());
  return Math.min(min, desired);
}

