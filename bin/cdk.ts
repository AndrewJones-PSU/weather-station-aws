#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LambdaStack } from "../lib/LambdaStack";
require("dotenv").config();

// ===== App configuration =====================================================

const app = new cdk.App();
const props: cdk.StackProps = {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
};

// ===== Stack configuration ===================================================

new LambdaStack(app, "LambdaStack", props);