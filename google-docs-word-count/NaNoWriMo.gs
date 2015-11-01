function updateCampNaNoWriMo() {
  var msg = "";

  var signIn = UrlFetchApp.fetch("https://campnanowrimo.org/sign_in");
  var csrfToken = signIn.getContentText().match(/content="(.+?)" name="csrf-token"/)[1];
  var headers = signIn.getAllHeaders();
  var cookies = headers["Set-Cookie"];
  //Logger.log(headers);
  //Logger.log(cookies);

  var params = {
    "user_session[name]": "YOUR_USERNAME",
    "user_session[password]": "YOUR_PASSWORD",
    "user_session[remember_me]": 0,
    "utf8": "&#x2713;",
    "authenticity_token": csrfToken
  };

  var options = {
    "method": "post",
    "payload": params,
    "Cookie": cookies
  };

  var test = UrlFetchApp.getRequest("https://campnanowrimo.org/sign_in", options);
  for(i in test) {
    Logger.log(i + ": " + test[i]);
  }

  var signedIn = UrlFetchApp.fetch("https://campnanowrimo.org/sign_in", options);
  //Logger.log(signedIn.getResponseCode());
  //Logger.log(signedIn.getAllHeaders());
  //Logger.log(signedIn.getContentText());

  return msg;
}

function updateNanowrimoWordCount(wordCount) {
  if (!wordCount) wordCount = getAdjustedWordCount();
  wordCount = wordCount.toString();

  var secretKey = getNanowrimoSecretKey();
  if (!secretKey) secretKey = promptForNanowrimoSecretKey();

  var username = getNanowrimoUsername();
  if (!username) username = promptForNanowrimoUsername();

  var hashable = secretKey + username + wordCount;
  var hashed = createSha1Hash(hashable);

  var url = "http://nanowrimo.org/api/wordcount";

  var payload = {
    "hash" : hashed,
    "name" : username,
    "wordcount": wordCount,
  };

  var options = {
    "method" : "put",
    "payload" : payload
  };

  log(url);
  log(options);

  // Expected: {"novel"=>"Novel Title", "old_wordcount"=>"123", "wordcount"=>"9876"}
  var response = UrlFetchApp.fetch(url, options);
  log(response);
  return response;
}

// sha1 functions via http://ramblings.mcpher.com/Home/excelquirks/gassnips/sha1

function createSha1Hash(hashable) {
  return byteToHexString(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, hashable));
}

function byteToHexString (bytes) {
  return bytes.reduce(function (p,c) {
    return p += padLeading ((c < 0 ? c+256 : c).toString(16), 2 );
  }, "");
}

function padLeading(stringtoPad, targetLength, padWith) {
  return (stringtoPad.length < targetLength ? Array(1+targetLength-stringtoPad.length).join(padWith | "0") : "") + stringtoPad;
}

function b64ToString(b64) {
  return Utilities.newBlob(Utilities.base64Decode(result.content)).getDataAsString();
}
