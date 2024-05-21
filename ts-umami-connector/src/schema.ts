// Schema --------------------------------------------------------------------------------
function getSchema(request: CCRequest): SchemaResponse {
  const apiPath = request.configParams[API_PATH_ID];

  let fields: GoogleAppsScript.Data_Studio.Fields | undefined;
  switch (apiPath) {
    case ACTIVE_PATH:
      fields = getSchemaOfActiveUsers();
      break;
    case EVENTS_PATH:
      fields = getSchemaOfEvents();
      break;
    case PAGE_VIEW_PATH:
      fields = getSchemaOfPageViews();
      break;
    case STATS_PATH:
      fields = getSchemaOfStats();
    case METRICS_PATH:
      fields = getSchemaOfMetrics();
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

function getSchemaOfPageViews(): GoogleAppsScript.Data_Studio.Fields {
  const fields = cc.getFields();
  const types = cc.FieldType;

  fields.newDimension()
    .setId("timestamp")
    .setType(types.TEXT);

  fields.newDimension()
    .setId("number_of_visitors")
    .setType(types.NUMBER);

  return fields;
}

function getSchemaOfStats(): GoogleAppsScript.Data_Studio.Fields {
  const fields = cc.getFields();
  const types = cc.FieldType;

  fields.newDimension()
    .setId("page_views_value")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("page_views_change")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("visitors_value")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("visitors_change")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("visits_value")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("visits_change")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("bounces_value")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("bounces_change")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("total_time_value")
    .setType(types.NUMBER);

  fields.newDimension()
    .setId("total_time_change")
    .setType(types.NUMBER);
  return fields;
}

function getSchemaOfMetrics(): GoogleAppsScript.Data_Studio.Fields {
  const fields = cc.getFields();
  const types = cc.FieldType;

  fields.newDimension()
    .setId("metric_type")
    .setType(types.TEXT);

  fields.newDimension()
    .setId("number_of_visitors")
    .setType(types.NUMBER);

  return fields;
}
// ---------------------------------------------------------------------------------------
