const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });
const dataTableName = process.env.DATA_TABLE_NAME;
const messageTableName = process.env.MESSAGE_TABLE_NAME;

module.exports.main = async (event) => {
	let messageType = event.mtype;
	let tableName;
	if (messageType === "dataup") tableName = dataTableName;
	else if (messageType === "message") tableName = messageTableName;
	else throw new Error(`Unknown message type: ${messageType}`);

	// create our dynamo parameters.
	let params = {
		TableName: tableName,
		Item: {
			weatherstationName: {
				S: event.deviceName,
			},
			scanTime: {
				N: Date.now().toString(),
			},
		},
	};

	// for a message event, add the message to the params
	if (messageType === "message") params.Item.message = event.message;

	// for a dataup event, add the sensor data into our params
	// iterate through all available sensors, store their data in the json
	// this shouldn't run on message events since sensorList doesn't exist
	for (const sensor of event.sensorList) {
		switch (sensor) {
			case "BME68X":
				params.Item.temperature = { N: event.temperature.toString() };
				params.Item.humidity = { N: event.humidity.toString() };
				params.Item.pressure = { N: event.pressure.toString() };
				break;
			case "PMSA003I":
				params.Item.pm10standard = { N: event.pm10standard.toString() };
				params.Item.pm25standard = { N: event.pm25standard.toString() };
				params.Item.pm100standard = { N: event.pm100standard.toString() };
				params.Item.pm10env = { N: event.pm10env.toString() };
				params.Item.pm25env = { N: event.pm25env.toString() };
				params.Item.pm100env = { N: event.pm100env.toString() };
				params.Item.particles03 = { N: event.particles03.toString() };
				params.Item.particles05 = { N: event.particles05.toString() };
				params.Item.particles10 = { N: event.particles10.toString() };
				params.Item.particles25 = { N: event.particles25.toString() };
				params.Item.particles50 = { N: event.particles50.toString() };
				params.Item.particles100 = { N: event.particles100.toString() };
				break;
			default:
				break;
		}
	}

	// now we add this to the DB
	const command = new PutItemCommand(params);
	let data;
	try {
		data = await dynamo.send(command);
	} catch (error) {
		let errorstr = "Error adding to the DB. Error JSON:" + JSON.stringify(error);
		console.error(errorstr);
		return errorstr;
	} finally {
		return "OK";
	}
};
