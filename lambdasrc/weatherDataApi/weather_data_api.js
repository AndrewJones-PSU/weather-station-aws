const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });
const dd_client = DynamoDBDocumentClient.from(dynamo);
const dataTableName = process.env.DATA_TABLE_NAME;
const messageTableName = process.env.MESSAGE_TABLE_NAME;
const { match } = require("assert");

module.exports.handler = async (event) => {
	// outline of generic response
	let res = {
		statusCode: 400,
		headers: {
			"Content-Type": "*/*",
		},
	};

	const params = event.queryStringParameters || {};
	let expectedParams;
	let missingParams;
	let queryParams;
	let dynamoResponse;
	switch (event.routeKey) {
		case "GET /current":
			// Check that our station query parameter exists
			if (!("station" in params)) {
				res.statusCode = 400;
				res.body = JSON.stringify({ message: `missing query parameter: station` });
				return res;
			}
			// Check that our station query parameter is valid
			if (match(params.station, /([a-zA-Z]|-|\d)+/) === null) {
				res.statusCode = 400;
				res.body = JSON.stringify({ message: "parameter 'station' is invalid" });
				return res;
			}
			// query DynamoDB
			dynamoResponse = await dynamoQuery({
				TableName: dataTableName,
				KeyConditionExpression: "weatherstationName = :weatherstationName",
				ExpressionAttributeValues: {
					":weatherstationName": params.station,
				},
				ScanIndexForward: false,
				Limit: 1,
			});
			if ("error" in dynamoResponse) {
				res.statusCode = 500;
				res.body = JSON.stringify(dynamoResponse.error);
				return res;
			}
			res.statusCode = 200;
			res.body = JSON.stringify(dynamoResponse.Items[0]);
			return res;
		case "GET /range":
			// We haven't finished this yet :P
			res.statusCode = 503;
			res.body = JSON.stringify({ message: "This path in the API has not yet been implemented :(" });
			return res;
			// Check that all our query parameters exist
			expectedParams = ["start", "end", "metric", "station"];
			missingParams = expectedParams.filter((param) => !(param in params));
			if (missingParams.length > 0) {
				res.statusCode = 400;
				res.body = JSON.stringify({ message: `missing query parameters: ${missingParams.join(", ")}` });
				return res;
			}

			// check that start and end are both numbers
			if (!isNumber(params.start)) {
				res.statusCode = 400;
				res.body = JSON.stringify({ message: "parameter 'start' is not a number" });
				return res;
			}
			if (!isNumber(params.end)) {
				res.statusCode = 400;
				res.body = JSON.stringify({ message: "parameter 'end' is not a number" });
				return res;
			}
			// check that station is a valid weather station

			// Check that metric is a valid metric
			// TODO
			res.statusCode = 200;
			res.body = JSON.stringify({
				temperature: 475,
				thisIsAPlaceholder: event.pathParameters.hours,
			});
			break;

		default:
			// This should never run but is probably the client's fault anyways if it does
			res.statusCode = 418;
			res.body = JSON.stringify({ message: `418 Invalid Route: ${event.routeKey}\nWould you like some tea?` });
			break;
	}
	return res;
};

// function to check if numbers are numbers
const isNumber = (v) => typeof v === "number" || (typeof v === "string" && Number.isFinite(+v));

// function to query a dynamodb table
const dynamoQuery = async (params) => {
	const command = new QueryCommand(params);
	let dynamoData;
	try {
		dynamoData = await dd_client.send(command);
		return dynamoData;
	} catch (error) {
		return {
			error: error,
		};
	}
};
