#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LambdaStack } from "../lib/LambdaStack";
import { IotStack } from "../lib/IotStack";
import { PolicyStack } from "../lib/PolicyStack";
import { PolicyStackProps } from "../lib/PolicyStack";
import { DynamoStack } from "../lib/DynamoStack";
import { DynamoLambdaRuleStack } from "../lib/DynamoLambdaRuleStack";
require("dotenv").config();

// ===== App configuration =====================================================

const app = new cdk.App();
const props: cdk.StackProps = {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
};
let policyprops: PolicyStackProps = {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
};

// ===== Stack configuration ===================================================

// IotStack
new IotStack(app, "IotStack", props);
// LambdaStack
// Declared since we need the arn of one of our functions for another stack
let lstack = new LambdaStack(app, "LambdaStack", props);

//policyprops.cron_lambda = lstack.cron_lambda;
//new PolicyStack(app, "PolicyStack", policyprops);
new DynamoStack(app, "DynamoStack", props);
new DynamoLambdaRuleStack(app, "DynamoLambdaRuleStack", props);
