// Schema --------------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------------------
