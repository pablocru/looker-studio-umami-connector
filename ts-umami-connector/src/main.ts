// Store ---------------------------------------------------------------------------------
const cc = DataStudioApp.createCommunityConnector();

const scriptProperties = PropertiesService.getScriptProperties();
const UMAMI_API_ENDPOINT = scriptProperties.getProperty("umami_api_endpoint") as string;

const USER_PROPERTY_TOKEN = "dscc.token";

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

type SchemaResponse = {
  schema: Field[]
}

interface CCRequest extends ConnectorRequest {
  dateRange: DateRange,
  fields: Field[]
}
// ---------------------------------------------------------------------------------------
