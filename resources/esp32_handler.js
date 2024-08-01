/* global fetch */

function buildResponseBody(status, body, headers = {}) {
	return {
		statusCode: status,
		headers,
		body,
	};
}

module.exports.main = async (event) => {
	const url = "http://";

	// Fetch the data from the ESP32
	let requestResponse = await fetch(url);
	return buildResponseBody(requestResponse.status, await requestResponse.json());
};
