// Config --------------------------------------------------------------------------------
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
    const apiPath = configParams[API_PATH_ID];

    if (apiPath !== ACTIVE_PATH) {
      switch (apiPath) {
        case EVENTS_PATH:
          getTimeRelatedInputs(config);
          getUrlInput(config);
          break;
        case PAGE_VIEW_PATH:
          getTimeRelatedInputs(config);
          getCommonInputs(config);
          break;
        case STATS_PATH:
          getCommonInputs(config);
          break;
        case METRICS_PATH:
          // Selector of metrics
          const selectType = config.newSelectSingle()
            .setId(TYPE_ID)
            .setName("Metrics type");
          for (const type of [
            "url", "referrer", "browser", "os", "device", "country", "event"
          ]) {
            selectType.addOption(
              config.newOptionBuilder().setLabel(type).setValue(type)
            );
          }
          getCommonInputs(config);
          getMetricInputs(config);
          break;
        default:
          cc.newUserError().setText("Invalid API path: " + apiPath).throwException();
          break;
      }

      config.setDateRangeRequired(true);
    }

    config.setIsSteppedConfig(false);
  }

  return config.build();
}

function getTimeRelatedInputs(config: GoogleAppsScript.Data_Studio.Config) {
  config.newTextInput()
    .setId(TIME_UNIT_ID)
    .setName("Time unit");

  config.newTextInput()
    .setId(TIMEZONE_ID)
    .setName("Timezone");
}

function getUrlInput(config: GoogleAppsScript.Data_Studio.Config) {
  config.newTextInput()
    .setId(URL_ID)
    .setName("(optional) Name of URL");
}

function getCommonInputs(config: GoogleAppsScript.Data_Studio.Config) {
  getUrlInput(config);

  config.newTextInput()
    .setId(REFERRER_ID)
    .setName("(optional) Name of referrer");

  config.newTextInput()
    .setId(PAGE_TITLE_ID)
    .setName("(optional) Name of page title");

  config.newTextInput()
    .setId(OS_ID)
    .setName("(optional) Name of operating system");

  config.newTextInput()
    .setId(BROWSER_ID)
    .setName("(optional) Name of browser");

  config.newTextInput()
    .setId(DEVICE_ID)
    .setName("(optional) Name of device (ex. Mobile)");

  config.newTextInput()
    .setId(COUNTRY_ID)
    .setName("(optional) Name of country");

  config.newTextInput()
    .setId(REGION_ID)
    .setName("(optional) Name of region/state/province");

  config.newTextInput()
    .setId(CITY_ID)
    .setName("(optional) Name of city");
}

function getMetricInputs(config: GoogleAppsScript.Data_Studio.Config) {
  config.newTextInput()
    .setId(LANGUAGE_ID)
    .setName("(optional) Name of language");

  config.newTextInput()
    .setId(EVENT_ID)
    .setName("(optional) Name of event");

  config.newTextInput()
    .setId(LIMIT_ID)
    .setName("(optional, default 500) Number of events returned");
}
// ---------------------------------------------------------------------------------------
