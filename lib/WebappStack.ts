import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_s3_deployment as s3d } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_apigatewayv2 as apig } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AllowedMethods } from "aws-cdk-lib/aws-cloudfront";
import { Effect } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class WebappStack extends cdk.Stack {
	siteDataStorage: s3.Bucket;
	weatherDataApiLambda: lambda.Function;
	weatherDataApi: apig.HttpApi;
	siteDataStorageDeployment: s3d.BucketDeployment;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Get our ENV values for table names, make sure they aren't empty
		let dataTableName = cdk.Fn.importValue("sensorscansTableName");
		let messageTableName = cdk.Fn.importValue("messagesTableName");
		if (!dataTableName) throw new Error("DATA_TABLE_NAME is not defined in .env");
		if (!messageTableName) throw new Error("MESSAGE_TABLE_NAME is not defined in .env");

		// S3 bucket to store static site data
		this.siteDataStorage = new s3.Bucket(this, "SiteDataStorage", {
			bucketName: "weather.sledward.com",
			publicReadAccess: true,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
			encryption: s3.BucketEncryption.S3_MANAGED,
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "404.html",
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});
		// CORS rules for the site
		const corsRule: s3.CorsRule = {
			allowedMethods: [s3.HttpMethods.GET],
			allowedOrigins: ["*"],
			allowedHeaders: ["*"],
			exposedHeaders: [],
		};
		this.siteDataStorage.addCorsRule(corsRule);

		// Deploy the S3 bucket with the site data in the "webappsrc" folder
		this.siteDataStorageDeployment = new s3d.BucketDeployment(this, "SiteDataStorageDeployment", {
			sources: [s3d.Source.asset("./webappsrc/ws-frontend/out")],
			destinationBucket: this.siteDataStorage,
		});

		// Output the address of the S3 bucket for defining the CNAME in your DNS Records
		new cdk.CfnOutput(this, "S3Address", {
			value: this.siteDataStorage.bucketWebsiteDomainName,
			description:
				"Address for the S3 bucket. In your DNS Records for your domain, create a CNAME record with this value!",
			exportName: "S3Address",
		});

		// Lambda function to handle API calls
		this.weatherDataApiLambda = new lambda.Function(this, "WeatherDataApiLambda", {
			runtime: lambda.Runtime.NODEJS_LATEST,
			code: lambda.Code.fromAsset("lambdasrc/weatherDataApi"),
			handler: "weather_data_api.handler",
			environment: {
				DATA_TABLE_NAME: dataTableName,
				MESSAGE_TABLE_NAME: messageTableName,
			},
		});
		// Allow Lambda function to query our Dynamo DB
		let sensorscansTableArn = cdk.Fn.importValue("sensorscansTableArn");
		let messagesTableArn = cdk.Fn.importValue("messagesTableArn");

		this.weatherDataApiLambda.addToRolePolicy(
			new iam.PolicyStatement({
				actions: ["dynamodb:Query"],
				effect: Effect.ALLOW,
				resources: [sensorscansTableArn, messagesTableArn],
			})
		);
		// API for fetching DB data
		this.weatherDataApi = new apig.HttpApi(this, "WeatherDataApi", {
			apiName: "WeatherDataApi",
			description: "HTTP API for Current and Historical Weather Data",
			corsPreflight: {
				allowOrigins: [this.siteDataStorage.urlForObject(), "http://weather.sledward.com"], // this works I think?
				allowHeaders: ["*"],
				allowMethods: [apig.CorsHttpMethod.GET],
				exposeHeaders: ["*"],
				maxAge: cdk.Duration.seconds(96400),
				allowCredentials: true,
			},
		});
		// Add integration to API pointing to Lambda function
		const weatherDataIntegration: HttpLambdaIntegration = new HttpLambdaIntegration(
			"WeatherDataIntegration",
			this.weatherDataApiLambda
		);
		// Add the routes to our integration
		this.weatherDataApi.addRoutes({
			path: "/current",
			methods: [apig.HttpMethod.GET],
			integration: weatherDataIntegration,
		});
		this.weatherDataApi.addRoutes({
			path: "/range",
			methods: [apig.HttpMethod.GET],
			integration: weatherDataIntegration,
		});
	}
}
