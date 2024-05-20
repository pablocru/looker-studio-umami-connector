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
// ---------------------------------------------------------------------------------------
