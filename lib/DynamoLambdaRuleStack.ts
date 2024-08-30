import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iot as iot } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
require("dotenv").config();

export class DynamoLambdaRuleStack extends cdk.Stack {
	iotToDynamo: lambda.Function;
	iotLambdaRule: iot.CfnTopicRule;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Get our ENV values for table names, make sure they aren't empty
		let dataTableName = cdk.Fn.importValue("sensorscansTableName");
		let messageTableName = cdk.Fn.importValue("messagesTableName");
		if (!dataTableName) throw new Error("DATA_TABLE_NAME is not defined in .env");
		if (!messageTableName) throw new Error("MESSAGE_TABLE_NAME is not defined in .env");
		// Lambda function to write sensor data (and messages) from the weather
		// stations to our DynamoDB instance
		this.iotToDynamo = new lambda.Function(this, "IotToDynamo", {
			runtime: lambda.Runtime.NODEJS_LATEST,
			code: lambda.Code.fromAsset("lambdasrc/nodejs"),
			handler: "iot_to_dynamo_handler.main",
			environment: {
				DATA_TABLE_NAME: dataTableName,
				MESSAGE_TABLE_NAME: messageTableName,
			},
		});

		// Get our table ARNs, allow our Lambda function to write to them
		let sensorscansTableArn = cdk.Fn.importValue("sensorscansTableArn");
		let messagesTableArn = cdk.Fn.importValue("messagesTableArn");

		this.iotToDynamo.addToRolePolicy(
			new iam.PolicyStatement({
				actions: ["dynamodb:PutItem"],
				effect: iam.Effect.ALLOW,
				resources: [sensorscansTableArn, messagesTableArn],
			})
		);

		// IoT rule piping data from weatherstations into the Lambda function
		this.iotLambdaRule = new iot.CfnTopicRule(this, "iotLambdaRule", {
			topicRulePayload: {
				sql: "SELECT * FROM 'ws/dataup/#'",
				actions: [
					{
						lambda: {
							functionArn: this.iotToDynamo.functionArn,
						},
					},
				],
			},
		});
	}
}
