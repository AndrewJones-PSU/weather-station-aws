import * as cdk from "aws-cdk-lib";
import { aws_dynamodb as dynamo } from "aws-cdk-lib";
import { Construct } from "constructs";

export class DynamoStack extends cdk.Stack {
	sensorscansTable: dynamo.Table;
	messagesTable: dynamo.Table;
	stationsTable: dynamo.Table;
	sensorsTable: dynamo.Table;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Get our ENV values for table names, make sure they aren't empty
		let sensorscansTableName = process.env.DATA_TABLE_NAME;
		let messageTableName = process.env.MESSAGE_TABLE_NAME;
		let stationsTableName = process.env.WEATHER_STATIONS_TABLE_NAME;
		let sensorsTableName = process.env.SENSORS_TABLE_NAME;
		if (!sensorscansTableName) throw new Error("DATA_TABLE_NAME is not defined in .env");
		if (!messageTableName) throw new Error("MESSAGE_TABLE_NAME is not defined in .env");
		if (!stationsTableName) throw new Error("WEATHER_STATIONS_TABLE_NAME is not defined in .env");
		if (!sensorsTableName) throw new Error("SENSORS_TABLE_NAME is not defined in .env");

		// Our table for sensor data
		this.sensorscansTable = new dynamo.Table(this, sensorscansTableName, {
			partitionKey: { name: "weatherstationName", type: dynamo.AttributeType.STRING },
			sortKey: { name: "scanTime", type: dynamo.AttributeType.NUMBER },
		});
		// Our table for messages from weather stations
		this.messagesTable = new dynamo.Table(this, messageTableName, {
			partitionKey: { name: "weatherstationName", type: dynamo.AttributeType.STRING },
			sortKey: { name: "scanTime", type: dynamo.AttributeType.NUMBER },
			readCapacity: 1,
			writeCapacity: 1,
		});
		// Table containing a list of weather stations and their sensor data
		this.stationsTable = new dynamo.Table(this, stationsTableName, {
			partitionKey: { name: "weatherstationName", type: dynamo.AttributeType.STRING },
			writeCapacity: 1,
		});
		// Table containing a list of used sensors and their supported metrics
		this.sensorsTable = new dynamo.Table(this, sensorsTableName, {
			partitionKey: { name: "sensor", type: dynamo.AttributeType.STRING },
			writeCapacity: 1,
		});

		// Save the ARNs and Names of our tables so we can use them in other stacks
		new cdk.CfnOutput(this, "sensorscansTableArn", {
			value: this.sensorscansTable.tableArn,
			description: "ARN of the sensorscans table",
			exportName: "sensorscansTableArn",
		});
		new cdk.CfnOutput(this, "messagesTableArn", {
			value: this.messagesTable.tableArn,
			description: "ARN of the messages table",
			exportName: "messagesTableArn",
		});
		new cdk.CfnOutput(this, "stationsTableArn", {
			value: this.stationsTable.tableArn,
			description: "ARN of the stations table",
			exportName: "stationsTableArn",
		});
		new cdk.CfnOutput(this, "sensorsTableArn", {
			value: this.sensorsTable.tableArn,
			description: "ARN of the sensors table",
			exportName: "sensorsTableArn",
		});

		new cdk.CfnOutput(this, "sensorscansTableName", {
			value: this.sensorscansTable.tableName,
			description: "Name of the sensorscans table",
			exportName: "sensorscansTableName",
		});
		new cdk.CfnOutput(this, "messagesTableName", {
			value: this.messagesTable.tableName,
			description: "Name of the messages table",
			exportName: "messagesTableName",
		});
		new cdk.CfnOutput(this, "stationsTableName", {
			value: this.stationsTable.tableName,
			description: "Name of the stations table",
			exportName: "stationsTableName",
		});
		new cdk.CfnOutput(this, "sensorsTableName", {
			value: this.sensorsTable.tableName,
			description: "Name of the sensors table",
			exportName: "sensorsTableName",
		});
	}
}
