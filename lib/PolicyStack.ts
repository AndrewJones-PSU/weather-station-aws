import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Action } from "aws-cdk-lib/aws-appconfig";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { execSync } from "child_process";
import { Construct } from "constructs";
require("dotenv").config();

export interface PolicyStackProps extends cdk.StackProps {
	cron_lambda?: lambda.Function;
}

export class PolicyStack extends cdk.Stack {
	cron_policy: iam.PolicyStatement;

	constructor(scope: Construct, id: string, props: PolicyStackProps) {
		super(scope, id, props);

		if (!props.cron_lambda) {
			throw new Error("Cron Lambda is not defined!");
		}

		this.cron_policy = new iam.PolicyStatement({
			actions: ["iot:Connect"],
			effect: iam.Effect.ALLOW,
			resources: [props.cron_lambda.functionArn],
		});

		props.cron_lambda.addToRolePolicy(this.cron_policy);
	}
}
