// rename this file to "env.h" and fill out the values below for your projects
#ifndef __ARDUINO_ENV_H__
#define __ARDUINO_ENV_H__

#include <pgmspace.h>

#define SECRET // no value needs to be assigned for SECRET

#define SSID ""
#define PASSWORD ""
#define AWS_IOT_ENDPOINT "xxxxx.amazonaws.com"
#define THING_NAME ""

// Amazon Root CA 1

static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
-----END CERTIFICATE-----
)EOF";

// Device Certificate
static const char AWS_CERT_CRT[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
-----END CERTIFICATE-----
)KEY";

// Device Private Key
static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----
)KEY";

#endif
