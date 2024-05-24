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

    case PAGE_VIEW_PATH:
      response = fetchPageViews(configParams, dateRange, token);
      break;

    case STATS_PATH:
      response = fetchStats(configParams, dateRange, token);
      break;

    case METRICS_PATH:
      response = fetchMetrics(configParams, dateRange, token);
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

  let rows: { values: any[] }[];
  switch (true) {
    case apiPath === STATS_PATH:
      rows = getStatsRows(parsedResponse);
      break;
    case apiPath === PAGE_VIEW_PATH:
      rows = getPageViewsRows(parsedResponse);
      break;
    case Array.isArray(parsedResponse):
      rows = parsedResponse.map((data: any) => ({ values: Object.values(data) }));
      break;
    default:
      rows = [{ values: [parsedResponse.x] }]
      break;
  }

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
    token
  );
}

function fetchEvents(
  configParams: EventsConfigParams,
  dateRange: DateRange,
  token: string
) {
  const { api_path, event_time_unit, event_timezone, url, website_id } = configParams;

  return fetchData(
    (
      UMAMI_API_ENDPOINT +
      "/api/websites/" +
      website_id +
      "/" +
      api_path +
      "?startAt=" + getTimestamp(dateRange.startDate) +
      "&endAt=" + getTimestamp(dateRange.endDate) +
      "&unit=" + event_time_unit +
      "&timezone=" + event_timezone +
      createOptionalQueryParams({ url })
    ),
    token
  );
}

function fetchPageViews(
  configParams: PageViewsConfigParams,
  dateRange: DateRange,
  token: string
) {
  const {
    api_path,
    browser,
    city,
    country,
    device,
    event_time_unit,
    event_timezone,
    os,
    page_title,
    referrer,
    region,
    url,
    website_id
  } = configParams;

  return fetchData(
    (
      UMAMI_API_ENDPOINT +
      "/api/websites/" +
      website_id +
      "/" +
      api_path +
      "?startAt=" + getTimestamp(dateRange.startDate) +
      "&endAt=" + getTimestamp(dateRange.endDate) +
      "&unit=" + event_time_unit +
      "&timezone=" + event_timezone +
      createOptionalQueryParams({
        browser,
        city,
        country,
        device,
        os,
        page_title,
        referrer,
        region,
        url,
      })
    ),
    token
  );
}

function fetchStats(
  configParams: StatsConfigParams,
  dateRange: DateRange,
  token: string
) {
  const {
    api_path,
    browser,
    city,
    country,
    device,
    os,
    page_title,
    referrer,
    region,
    url,
    website_id
  } = configParams;

  return fetchData(
    (
      UMAMI_API_ENDPOINT +
      "/api/websites/" +
      website_id +
      "/" +
      api_path +
      "?startAt=" + getTimestamp(dateRange.startDate) +
      "&endAt=" + getTimestamp(dateRange.endDate) +
      createOptionalQueryParams({
        browser,
        city,
        country,
        device,
        os,
        page_title,
        referrer,
        region,
        url,
      })
    ),
    token
  );
}

function fetchMetrics(
  configParams: MetricsConfigParams,
  dateRange: DateRange,
  token: string
) {
  const {
    api_path,
    browser,
    city,
    country,
    device,
    event,
    language,
    limit,
    os,
    page_title,
    referrer,
    region,
    type,
    url,
    website_id,
  } = configParams;

  return fetchData(
    (
      UMAMI_API_ENDPOINT +
      "/api/websites/" +
      website_id +
      "/" +
      api_path +
      "?startAt=" + getTimestamp(dateRange.startDate) +
      "&endAt=" + getTimestamp(dateRange.endDate) +
      "&type=" + type +
      createOptionalQueryParams({
        browser,
        city,
        country,
        device,
        event,
        language,
        limit,
        os,
        page_title,
        referrer,
        region,
        url,
      })
    ),
    token
  );
}

function fetchData(url: string, token: string) {
  return UrlFetchApp.fetch(encodeURI(url), {
    method: "get",
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
}

function getTimestamp(date: string) {
  return new Date(date).getTime()
}

function createOptionalQueryParams(...params: ({ [key: string]: string | undefined })[]) {
  return params.reduce((lastParam, currentParam) => {
    const [key, value] = Object.entries(currentParam)[0];

    if (!value) return lastParam;

    const newParam = "&" + key + "=" + value;

    return lastParam + newParam;
  }, "");
}

type StatsResponseMetric = { "value": number, "change": number }
type StatsResponse = {
  pageviews: StatsResponseMetric,
  visitors: StatsResponseMetric,
  visits: StatsResponseMetric,
  bounces: StatsResponseMetric,
  totaltime: StatsResponseMetric
}
function getStatsRows(statsResponse: StatsResponse) {
  const values = [];

  let metric: keyof StatsResponse;
  for (metric in statsResponse) {
    const { value, change } = statsResponse[metric];
  
    values.push(value, change);
  }

  return [{ values }];
}

type PageViewsResponseMetric = { x: string, y: number }
type PageViewsResponse = {
  pageviews: PageViewsResponseMetric[]
  sessions: PageViewsResponseMetric[]
}
function getPageViewsRows (pageViewsResponse: PageViewsResponse) {
  const { pageviews, sessions } = pageViewsResponse;

  pageviews.sort(sortDatesFromObject);
  sessions.sort(sortDatesFromObject);

  function sortDatesFromObject (
    pageView: PageViewsResponseMetric,
    session: PageViewsResponseMetric
  ) {
    const { x } = pageView;
    const { x: y } = session;

    return (
      x > y ? 1 :
        x < y ? -1 : 0
    )
  }

  const rows = [];
  for (let i = 0; i < pageviews.length; i++) {
    const pageView = pageviews[i];
    const session = sessions[i];

    rows.push({ values: [pageView.x, pageView.y, session.y] })
  }
  return rows;
}
// ---------------------------------------------------------------------------------------
