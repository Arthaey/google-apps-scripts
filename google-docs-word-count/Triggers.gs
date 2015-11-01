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

function runUpdateTrigger() {
  var wordCounts = updateReportCard();
  var wordCount = wordCounts["new"];
  var nanoResponse = updateNanowrimoWordCount(wordCount);
  log(nanoResponse);
  updateWordCountDisplay(wordCount);
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

