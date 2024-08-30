import * as cdk from "aws-cdk-lib";
import { aws_dynamodb as dynamo } from "aws-cdk-lib";
import { Construct } from "constructs";

export class DynamoStack extends cdk.Stack {
	sensorscansTable: dynamo.Table;
	messagesTable: dynamo.Table;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Get our ENV values for table names, make sure they aren't empty
		let sensorscansTableName = process.env.DATA_TABLE_NAME;
		let messageTableName = process.env.MESSAGE_TABLE_NAME;
		if (!sensorscansTableName) throw new Error("DATA_TABLE_NAME is not defined in .env");
		if (!messageTableName) throw new Error("MESSAGE_TABLE_NAME is not defined in .env");
		// Our table for sensor data
		this.sensorscansTable = new dynamo.Table(this, sensorscansTableName, {
			partitionKey: { name: "weatherstationName", type: dynamo.AttributeType.STRING },
			sortKey: { name: "scanTime", type: dynamo.AttributeType.NUMBER },
		});
		// Our table for messages from weather stations
		this.messagesTable = new dynamo.Table(this, messageTableName, {
			partitionKey: { name: "weatherstationName", type: dynamo.AttributeType.STRING },
			sortKey: { name: "scanTime", type: dynamo.AttributeType.NUMBER },
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
	}
}
