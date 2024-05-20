// Data ----------------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------------------
