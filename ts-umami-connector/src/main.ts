// Store ---------------------------------------------------------------------------------
const cc = DataStudioApp.createCommunityConnector();

const scriptProperties = PropertiesService.getScriptProperties();
const UMAMI_API_ENDPOINT = scriptProperties.getProperty("umami_api_endpoint");

const USER_PROPERTY_TOKEN = "dscc.token";

// Authentication ------------------------------------------------------------------------
function getAuthType() {
  const AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.USER_PASS)
    .setHelpUrl("https://umami.is/docs/api/authentication")
    .build();
}

type CredentialsRequest = {
  userPass: {
    username: string;
    password: string;
  };
};

function setCredentials(
  request: CredentialsRequest
): GoogleAppsScript.Data_Studio.SetCredentialsResponse {
  const { username, password } = request.userPass;

  const response = UrlFetchApp.fetch(UMAMI_API_ENDPOINT + "/api/auth/login", {
    method: "post",
    payload: { username, password },
    muteHttpExceptions: true,
  });

  const isValid = response.getResponseCode() === 200;

  if (isValid) {
    const userProperties = PropertiesService.getUserProperties();

    const result = JSON.parse(response.getContentText());

    userProperties.setProperty(USER_PROPERTY_TOKEN, result.token);
  }

  return cc.newSetCredentialsResponse().setIsValid(isValid).build();
}

function resetAuth() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty(USER_PROPERTY_TOKEN);
}

function isAuthValid() {
  const userProperties = PropertiesService.getUserProperties();
  const token = userProperties.getProperty(USER_PROPERTY_TOKEN);

  const response = UrlFetchApp.fetch(UMAMI_API_ENDPOINT + "/api/auth/verify", {
    method: "post",
    headers: { Authorization: `Bearer "${token}"` },
    muteHttpExceptions: true,
  });

  return response.getResponseCode() === 200;
}
// ---------------------------------------------------------------------------------------

function getConfig() {}
function getSchema() {}
function getData() {}
