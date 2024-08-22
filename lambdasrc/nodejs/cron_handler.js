let awssdk = require("@aws-sdk/client-iot-data-plane");

let client = new awssdk.IoTDataPlaneClient({ region: process.env.AWS_REGION, endpoint: process.env.AWS_IOT_ENDPOINT });

module.exports.main = async (event) => {
	let params = {
		topic: "ws-pittsburgh-1/request",
		payload: JSON.stringify({
			time: Date.now(),
		}),
		qos: 1,
	};

	const command = new awssdk.PublishCommand(params);
	return await client.send(command);
};
