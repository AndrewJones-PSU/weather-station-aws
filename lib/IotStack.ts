import * as cdk from "aws-cdk-lib";
import { aws_iot as iot } from "aws-cdk-lib";
import { Construct } from "constructs";
import { exec } from "child_process";
import path = require("path");
import fs = require("fs");

export class IotStack extends cdk.Stack {
	wsPittsburgh1: iot.CfnThing;
	wsPittsburgh1Cert: iot.CfnCertificate;
	wsPittsburgh1Policy: iot.CfnPolicy;
	wsPittsburgh1ThingPrincipalAttachment: iot.CfnThingPrincipalAttachment;
	wsPittsburgh1PolicyPrincipalAttachment: iot.CfnPolicyPrincipalAttachment;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		this.wsPittsburgh1 = new iot.CfnThing(this, "WsPittsburgh1", {
			thingName: "ws-pittsburgh-1",
		});

		this.wsPittsburgh1Cert = new iot.CfnCertificate(this, "WsPittsburgh1Cert", {
			status: "ACTIVE",
			certificateSigningRequest: fs.readFileSync(path.resolve("./iot_cert/cert.csr"), "utf8"),
		});

		this.wsPittsburgh1Policy = new iot.CfnPolicy(this, "WsPittsburgh1Policy", {
			policyName: "WsPittsburgh1Policy",
			policyDocument: {
				Version: "2012-10-17",
				Statement: [
					{
						Effect: "Allow",
						Action: ["iot:Connect"],
						Resource: [`arn:aws:iot:${this.region}:${this.account}:client/${this.wsPittsburgh1.thingName}`],
					},
					{
						Effect: "Allow",
						Action: ["iot:Publish"],
						Resource: [
							`arn:aws:iot:${this.region}:${this.account}:topic/ws/dataup/${this.wsPittsburgh1.thingName}`,
						],
					},
					{
						Effect: "Allow",
						Action: ["iot:Subscribe"],
						Resource: [`arn:aws:iot:${this.region}:${this.account}:topicfilter/ws/*`],
					},
					{
						Effect: "Allow",
						Action: ["iot:Receive"],
						Resource: [`arn:aws:iot:${this.region}:${this.account}:topic/ws/*`],
					},
				],
			},
		});

		this.wsPittsburgh1ThingPrincipalAttachment = new iot.CfnThingPrincipalAttachment(
			this,
			"ThingPrincipalAttachment",
			{
				thingName: this.wsPittsburgh1.thingName || "ThingPrincipalAttachment",
				principal: this.wsPittsburgh1Cert.attrArn,
			}
		);

		this.wsPittsburgh1PolicyPrincipalAttachment = new iot.CfnPolicyPrincipalAttachment(
			this,
			"PolicyPrincipalAttachment",
			{
				policyName: this.wsPittsburgh1Policy.policyName || "PolicyPrincipalAttachment",
				principal: this.wsPittsburgh1Cert.attrArn,
			}
		);
	}
}
