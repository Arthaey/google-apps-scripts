function installCheckGoalTrigger() {
  var handlerFunctionName = "runCheckGoalForToday";
  if (!isFunctionAssignedToTrigger(handlerFunctionName)) {
    g_checkGoalTrigger = ScriptApp.newTrigger(handlerFunctionName)
        .timeBased()
        .everyMinutes(5)
        .create();
  }
}

function installUpdateTrigger() {
  var handlerFunctionName = "runUpdateTrigger";
  if (!isFunctionAssignedToTrigger(handlerFunctionName)) {
    g_updateTrigger = ScriptApp.newTrigger(handlerFunctionName)
        .timeBased()
        .everyMinutes(15)
        .create();
  }
}

function runCheckGoalForToday() {
  var goal = getGoalForToday();
  var actual = getAdjustedWordCount();
  log("Checking progress: goal " + goal + ", actual " + actual + ".");
  if (actual >= goal) {
    alertMetGoalForToday(goal, actual);
    ScriptApp.deleteTrigger(g_checkGoalTrigger);
  }
  updateWordCountDisplay(actual);
}

// Because there is no "onClose" event, delete this trigger
// if there has been no change in word count between runs.
function runUpdateTrigger() {
  g_lastWordCount = g_thisWordCount;
  var wordCounts = updateReportCard();
  g_thisWordCount = wordCounts["new"];

  log("LAST WORD COUNT: " + g_lastWordCount);
  log("THIS WORD COUNT: " + g_thisWordCount);
  if (g_thisWordCount == g_lastWordCount) {
    log("Deleting update trigger because no change in word count between runs.");
    ScriptApp.deleteTrigger(g_updateTrigger);
  }
  updateWordCountDisplay();
}

// Returns true if function is already assigned to a trigger, false otherwise.
function isFunctionAssignedToTrigger(handlerFunctionName) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == handlerFunctionName) {
      return true;
    }
  }
  return false
}

