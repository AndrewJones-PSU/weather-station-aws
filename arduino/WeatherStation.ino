#include "Adafruit_PM25AQI.h"
#include "Adafruit_BME680.h"
#include <WiFi.h>
#include "env.h"

// initialize sensor libraries (all use i2c)
Adafruit_PM25AQI aqi = Adafruit_PM25AQI();
Adafruit_BME680 bme;

// initialize webserver
WiFiServer server(80);

// Current time
unsigned long currentTime = millis();
// Previous time
unsigned long previousTime = 0;
// Define timeout time in milliseconds (example: 2000ms = 2s)
const long timeoutTime = 2000;

void setup()
{
	// Init Serial (for debug)
	Serial.begin(115200);
	while (!Serial)
		delay(10);

	Serial.println("Weather Station starting");

	// Init WiFi
	Serial.print("Connecting to WiFi");
	WiFi.begin(SSID, PASSWORD);
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(1000);
		Serial.print(".");
	}
	Serial.print(" Done! Connected as ");
	Serial.println(WiFi.localIP());

	Serial.print("initializing Sensors...");
	if (!aqi.begin_I2C())
	{
		Serial.println("Could not find a valid PM2.5 sensor, check wiring!");
		while (1)
			delay(10);
	}
	if (!bme.begin())
	{
		Serial.println("Could not find a valid BME680 sensor, check wiring!");
		while (1)
			delay(10);
	}

	bme.setTemperatureOversampling(BME680_OS_8X);
	bme.setHumidityOversampling(BME680_OS_2X);
	bme.setPressureOversampling(BME680_OS_4X);
	bme.setIIRFilterSize(BME680_FILTER_SIZE_3);

	Serial.println(" Done!");

	Serial.print("Starting web server...");
	server.begin();
	Serial.println(" Done!");
}

void loop()
{
	// Get sensor data
	PM25_AQI_Data aqidata;
	aqi.read(&aqidata);
	bme.performReading();

	// Check if any clients are available
	WiFiClient client = server.available();

	if (client)
	{
		Serial.println("New client");

		currentTime = millis();
		previousTime = currentTime;
		// an http request ends with a blank line
		boolean currentLineIsBlank = true;
		while (client.connected() && currentTime - previousTime <= timeoutTime)
		{
			currentTime = millis();
			if (client.available())
			{
				char c = client.read();
				Serial.write(c);
				// if you've gotten to the end of the line (received a newline
				// character) and the line is blank, the http request has ended,
				// so you can send a reply
				if (c == '\n')
				{
					// send a standard http response header
					client.println("HTTP/1.1 200 OK");
					client.println("Content-Type: application/json");
					client.println("Access-Control-Allow-Origin: *");
					client.println("Access-Control-Allow-Methods: GET");
					client.println("Connection: close");
					client.println();

					// start JSON object
					client.println("{");

					// AQI data
					client.println("\t\"aqi\": {");
					client.print("\t\t\"pm10\": ");
					client.print(aqidata.pm10_env);
					client.println(",");
					client.print("\t\t\"pm25\": ");
					client.print(aqidata.pm25_env);
					client.println(",");
					client.print("\t\t\"pm100\": ");
					client.print(aqidata.pm100_env);
					client.println(",");
					client.println("\t\t\"unit\": \"ug/m^3\"");
					client.println("\t},");

					// Particles data
					client.println("\t\"particles\": {");
					client.print("\t\t\"3\": ");
					client.print(aqidata.particles_03um);
					client.println(",");
					client.print("\t\t\"5\": ");
					client.print(aqidata.particles_05um);
					client.println(",");
					client.print("\t\t\"10\": ");
					client.print(aqidata.particles_10um);
					client.println(",");
					client.print("\t\t\"25\": ");
					client.print(aqidata.particles_25um);
					client.println(",");
					client.print("\t\t\"50\": ");
					client.print(aqidata.particles_50um);
					client.println(",");
					client.print("\t\t\"100\": ");
					client.print(aqidata.particles_100um);
					client.println(",");
					client.println("\t\t\"unit\": \"um/0.1L\"");
					client.println("\t},");

					// BME680 data
					client.println("\t\"bme680\": {");
					client.print("\t\t\"temperature\": ");
					client.print(bme.temperature);
					client.println(",");
					client.print("\t\t\"humidity\": ");
					client.print(bme.humidity);
					client.println(",");
					client.print("\t\t\"pressure\": ");
					client.print(bme.pressure / 100.0);
					client.println(",");
					client.print("\t\t\"gas\": ");
					client.print(bme.gas_resistance / 1000.0);
					client.println(",");
					client.println("\t\t\"units\": {");
					client.println("\t\t\t\"temperature\": \"C\",");
					client.println("\t\t\t\"humidity\": \"%\",");
					client.println("\t\t\t\"pressure\": \"hPa\",");
					client.println("\t\t\t\"gas\": \"KOhms\"");
					client.println("\t\t}");
					client.println("\t}");

					// end JSON object
					client.println("}");

					break;
				}
				else if (c != '\r')
				{
					// you're starting a new line
					currentLineIsBlank = false;
				}
			}
		}
		client.stop();
		Serial.println("Client disconnected");
	}
}
