// Store ---------------------------------------------------------------------------------
const cc = DataStudioApp.createCommunityConnector();

const scriptProperties = PropertiesService.getScriptProperties();
const UMAMI_API_ENDPOINT = scriptProperties.getProperty("umami_api_endpoint") as string;

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

// Config --------------------------------------------------------------------------------
// Store --------------------------------------------------
const WEBSITE_ID_INPUT_ID = "website_id";
const API_PATH_ID = "api_path";
const EVENT_TIME_UNIT_ID = "event_time_unit";
const EVENT_TIMEZONE_ID = "event_timezone";
const ACTIVE_PATH = "active";
const EVENTS_PATH = "events";
const STATS_PATH = "stats";
const METRICS_PATH = "metrics";
const VALID_PATHS = [
  ["Active users", ACTIVE_PATH],
  ["Website events", EVENTS_PATH],
  ["Summarized stats", STATS_PATH],
  ["Metrics", METRICS_PATH]
]
let apiPath: string;
type ConfigParams = {
  [WEBSITE_ID_INPUT_ID]: string
  [API_PATH_ID]: string
  [EVENT_TIME_UNIT_ID]: string
  [EVENT_TIMEZONE_ID]: string
}
type ConnectorRequest = { configParams: ConfigParams }
type Field = { name: string, dataType?: string }
type DateRange = {
  startDate: string,
  endDate: string
}
interface CCRequest extends ConnectorRequest {
  dateRange: DateRange,
  fields: Field[]
}
type SchemaResponse = {
  schema: Field[]
}

// Functions ----------------------------------------------
function getConfig(request?: ConnectorRequest) {
  const configParams = request?.configParams;

  const config = cc.getConfig();
  // By default, it will be a infinite loop until all questions are done
  config.setIsSteppedConfig(true);

  // First step is to get the website id and Api path
  // Website Id -------------------------------------------
  config.newTextInput()
    .setId(WEBSITE_ID_INPUT_ID)
    .setName("Website id")
    .setPlaceholder("02d89813-7a72-41e1-87f0-8d668f85008b");
  // ------------------------------------------------------

  // Api path ---------------------------------------------
  const select = config.newSelectSingle()
    .setId(API_PATH_ID)
    .setName("What do you want to search?")
    .setIsDynamic(true);

  for (const [LABEL, VALUE] of VALID_PATHS) {
    select.addOption(config.newOptionBuilder().setLabel(LABEL).setValue(VALUE));
  }
  // ------------------------------------------------------

  // Next times this function is called this object will be filled
  if (
    configParams &&
    configParams.hasOwnProperty(WEBSITE_ID_INPUT_ID) &&
    configParams[WEBSITE_ID_INPUT_ID].length > 0 &&
    configParams.hasOwnProperty(API_PATH_ID) &&
    configParams[API_PATH_ID].length > 0
  ) {
    apiPath = configParams[API_PATH_ID];

    if (apiPath !== ACTIVE_PATH) {
      switch (apiPath) {
        case EVENTS_PATH:
          config.newTextInput()
            .setId(EVENT_TIME_UNIT_ID)
            .setName("Time unit");

          config.newTextInput()
            .setId(EVENT_TIMEZONE_ID)
            .setName("Timezone");
          break;
        default:
          break;
      }

      config.setDateRangeRequired(true);
    }

    config.setIsSteppedConfig(false);
  }

  return config.build();
}

function getSchemaOfActiveUsers(): GoogleAppsScript.Data_Studio.Fields {
  const fields = cc.getFields();
  const types = cc.FieldType;

  fields.newDimension()
    .setId("number_of_unique_visitors")
    .setType(types.NUMBER);

  return fields;
}

function getSchemaOfEvents(): GoogleAppsScript.Data_Studio.Fields {
  const fields = cc.getFields();
  const types = cc.FieldType;

  fields.newDimension()
    .setId("event_name")
    .setType(types.TEXT);

  fields.newDimension()
    .setId("event_date")
    .setType(types.TEXT);

  fields.newDimension()
    .setId("number_events")
    .setType(types.NUMBER);

  return fields;
}

function getSchema(request: CCRequest): SchemaResponse {
  const apiPath = request.configParams[API_PATH_ID];

  let fields: GoogleAppsScript.Data_Studio.Fields | undefined;
  switch (apiPath) {
    case EVENTS_PATH:
      fields = getSchemaOfEvents();
      break;
    case ACTIVE_PATH:
      fields = getSchemaOfActiveUsers();
      break;
    default:
      cc.newUserError().setText("Invalid API path: " + apiPath).throwException();
      break;
  }

  if (!fields) {
    const errMessage = "Error while creating the schema: the fields are empty";
    cc.newUserError().setText(errMessage).throwException();
  }

  return { "schema": fields!.build() };
}

function fetchActiveUsers(configParams: ConfigParams, token: string) {
  return fetchData(
    (
      UMAMI_API_ENDPOINT +
      "/api/websites/" +
      configParams[WEBSITE_ID_INPUT_ID] +
      "/" +
      configParams[API_PATH_ID]
    ),
    "get",
    token
  );
}

function fetchEvents(configParams: ConfigParams, dateRange: DateRange, token: string) {
  return fetchData(
    (
      UMAMI_API_ENDPOINT +
      "/api/websites/" +
      configParams[WEBSITE_ID_INPUT_ID] +
      "/" +
      configParams[API_PATH_ID] +
      "?startAt=" + getTimestamp(dateRange.startDate) +
      "&endAt=" + getTimestamp(dateRange.endDate) +
      "&unit=" + configParams[EVENT_TIME_UNIT_ID] +
      "&timezone=" + configParams[EVENT_TIMEZONE_ID]
    ),
    "get",
    token
  );
}

function getData(request: CCRequest) {
  const { configParams, dateRange } = request

  const userProperties = PropertiesService.getUserProperties();
  const token = userProperties.getProperty(USER_PROPERTY_TOKEN) as string;

  const apiPath = configParams[API_PATH_ID];

  let response: GoogleAppsScript.URL_Fetch.HTTPResponse | undefined;
  switch (apiPath) {
    case ACTIVE_PATH:
      response = fetchActiveUsers(configParams, token);
      break;
    case EVENTS_PATH:
      response = fetchEvents(configParams, dateRange, token);
      break;
  }

  if (!response) {
    const errMessage = "Error while fetching data: there is no response from Umami";
    cc.newUserError().setText(errMessage).throwException();
  }

  const { getContentText, getResponseCode } = response!;

  const responseText = getContentText();
  const responseCode = getResponseCode();

  if (responseCode !== 200) {
    const errorMessage =
      "Error while fetching data: " +
      responseCode + " - " +
      responseText
    cc.newUserError().setText(errorMessage).throwException();
  }

  const parsedResponse = JSON.parse(responseText)

  const rows =
    !Array.isArray(parsedResponse) ?
      [{ values: [parsedResponse.x] }] :
      parsedResponse.map((data: any) => ({ values: Object.values(data) }));

  return Object.assign({}, getSchema(request), { rows });
}

function fetchData(
  url: string,
  method: GoogleAppsScript.URL_Fetch.HttpMethod,
  token: string
) {
  return UrlFetchApp.fetch(encodeURI(url), {
    method,
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
}

function getTimestamp(date: string) {
  return new Date(date).getTime()
}
