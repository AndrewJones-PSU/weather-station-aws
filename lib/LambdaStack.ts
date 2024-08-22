import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Action } from "aws-cdk-lib/aws-appconfig";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { execSync } from "child_process";
import { Construct } from "constructs";
require("dotenv").config();

export class LambdaStack extends cdk.Stack {
	cron_lambda: lambda.Function;
	esp32_lambda: lambda.Function;
	webserver_lambda: lambda.Function;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		let iot_endpoint = process.env.AWS_IOT_ENDPOINT;
		if (!iot_endpoint) {
			throw new Error("AWS_IOT_ENDPOINT environment variable is not set");
		}
		this.cron_lambda = new lambda.Function(this, "CronLambda", {
			runtime: lambda.Runtime.NODEJS_LATEST,
			code: lambda.Code.fromAsset("lambdasrc/nodejs"),
			handler: "cron_handler.main",
		});
		// this.cron_lambda.addToRolePolicy(
		// 	new iam.PolicyStatement({
		// 		actions: ["iot:Connect"],
		// 		effect: iam.Effect.ALLOW,
		// 		resources: [this.cron_lambda.functionArn],
		// 	})
		// );

		this.esp32_lambda = new lambda.Function(this, "ESP32Lambda", {
			runtime: lambda.Runtime.NODEJS_LATEST,
			code: lambda.Code.fromAsset("lambdasrc/nodejs"),
			handler: "esp32_handler.main",
		});

		this.webserver_lambda = new lambda.Function(this, "WebserverLambda", {
			runtime: lambda.Runtime.NODEJS_LATEST,
			code: lambda.Code.fromAsset("lambdasrc/nodejs"),
			handler: "webserver_handler.main",
		});
	}
}
