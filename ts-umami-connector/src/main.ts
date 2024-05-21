// Store ---------------------------------------------------------------------------------
const cc = DataStudioApp.createCommunityConnector();

const scriptProperties = PropertiesService.getScriptProperties();
const UMAMI_API_ENDPOINT = scriptProperties.getProperty("umami_api_endpoint") as string;

const USER_PROPERTY_TOKEN = "dscc.token";

const WEBSITE_ID_INPUT_ID = "website_id";
const API_PATH_ID = "api_path";
const TIME_UNIT_ID = "event_time_unit";
const TIMEZONE_ID = "event_timezone";
const URL_ID = "url";
const REFERRER_ID = "referrer";
const PAGE_TITLE_ID = "page_title";
const OS_ID = "os";
const BROWSER_ID = "browser";
const DEVICE_ID = "device";
const COUNTRY_ID = "country";
const REGION_ID = "region";
const CITY_ID = "city";
const TYPE_ID = "type";
const LANGUAGE_ID = "language";
const EVENT_ID = "event";
const LIMIT_ID = "limit";

const ACTIVE_PATH = "active";
const EVENTS_PATH = "events";
const PAGE_VIEW_PATH = "page_view";
const STATS_PATH = "stats";
const METRICS_PATH = "metrics";
const VALID_PATHS = [
  ["Active users", ACTIVE_PATH],
  ["Website events", EVENTS_PATH],
  ["Page views", PAGE_VIEW_PATH],
  ["Summarized stats", STATS_PATH],
  ["Metrics", METRICS_PATH]
]

interface BaseConfigParams {
  [WEBSITE_ID_INPUT_ID]: string
  [API_PATH_ID]: string
}

interface TimeRelatedConfigParams {
  [TIME_UNIT_ID]: string
  [TIMEZONE_ID]: string
}

interface CommonConfigParams {
  [URL_ID]: string | undefined
  [REFERRER_ID]: string | undefined
  [PAGE_TITLE_ID]: string | undefined
  [OS_ID]: string | undefined
  [BROWSER_ID]: string | undefined
  [DEVICE_ID]: string | undefined
  [COUNTRY_ID]: string | undefined
  [REGION_ID]: string | undefined
  [CITY_ID]: string | undefined
}

interface EventsConfigParams extends BaseConfigParams, TimeRelatedConfigParams {
  [URL_ID]: string | undefined
}

interface PageViewsConfigParams extends
  BaseConfigParams, TimeRelatedConfigParams, CommonConfigParams {}

interface StatsConfigParams extends BaseConfigParams, CommonConfigParams {}

interface MetricsConfigParams extends StatsConfigParams {
  [TYPE_ID]: "url" | "referrer" | "browser" | "os" | "device" | "country" | "event"
  [LANGUAGE_ID]: string | undefined
  [EVENT_ID]: string | undefined
  [LIMIT_ID]: string | undefined
}

interface ConfigParams extends TimeRelatedConfigParams, MetricsConfigParams {}

type ConnectorRequest = { configParams: ConfigParams }

type Field = { name: string, dataType?: string }

type DateRange = {
  startDate: string,
  endDate: string
}

type SchemaResponse = {
  schema: Field[]
}

interface CCRequest extends ConnectorRequest {
  dateRange: DateRange,
  fields: Field[]
}
// ---------------------------------------------------------------------------------------
