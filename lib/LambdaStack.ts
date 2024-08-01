import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { Construct } from "constructs";

export class LambdaStack extends cdk.Stack {
    esp32_lambda: lambda.Function;
    webserver_lambda: lambda.Function;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.esp32_lambda = new lambda.Function(this, "ESP32Lambda", {
            runtime: lambda.Runtime.NODEJS_LATEST,
            code: lambda.Code.fromAsset("resources"),
            handler: "esp32_handler.main",
        });

        this.webserver_lambda = new lambda.Function(this, "WebserverLambda", {
            runtime: lambda.Runtime.NODEJS_LATEST,
            code: lambda.Code.fromAsset("resources"),
            handler: "webserver_handler.main",
        });
    }
}