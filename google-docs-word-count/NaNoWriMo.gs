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

