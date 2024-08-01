/* global fetch */

function buildResponseBody(status, body, headers = {}) {
	return {
		statusCode: status,
		headers,
		body,
	};
}

module.exports.main = async (event) => {
	return buildResponseBody(200, "Hello, World!");
};
