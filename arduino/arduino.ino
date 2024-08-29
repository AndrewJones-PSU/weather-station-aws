#include <Adafruit_PM25AQI.h>
#include <Adafruit_BME680.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <MQTTClient.h>
#include <ArduinoJson.h>
#include <ArduinoQueue.h>
#include "env.h"

// initialize sensor libraries (all use i2c)
Adafruit_PM25AQI aqi = Adafruit_PM25AQI();
Adafruit_BME680 bme;

unsigned long lastread;
PM25_AQI_Data aqidata;
bool isreading;

// The MQTT topics that this device should publish/subscribe
#define AWS_IOT_PUBLISH_TOPIC "ws/dataup/ws-pittsburgh-1"
#define AWS_IOT_SUBSCRIBE_TOPIC "ws/request"

// Wifi and MQTT clients
WiFiClientSecure net = WiFiClientSecure();
MQTTClient client = MQTTClient(256);

// Queues for storing data points
#define QUEUE_LENGTH 60
#define READ_INTERVAL 1000
#define MIN_READ_DELAY_INTERVAL 250
struct alldata
{
	int pm10standard;
	int pm25standard;
	int pm100standard;
	int pm10env;
	int pm25env;
	int pm100env;
	int particles03;
	int particles05;
	int particles10;
	int particles25;
	int particles50;
	int particles100;
	float temperature;
	int pressure;
	float humidity;
};
ArduinoQueue<alldata> dataqueue(60);

// ===== Connecting to WiFi & AWS ==============================================

void connectAWS()
{
	WiFi.mode(WIFI_STA);
	WiFi.begin(SSID, PASSWORD);

	Serial.print("Connecting to WiFi");

	while (WiFi.status() != WL_CONNECTED)
	{
		delay(1000);
		Serial.print(".");
	}

	Serial.println();
	Serial.println("WiFi Connected!");

	// Configure WiFiClientSecure to use the AWS IoT device credentials
	net.setCACert(AWS_CERT_CA);
	net.setCertificate(AWS_CERT_CRT);
	net.setPrivateKey(AWS_CERT_PRIVATE);

	// Connect to the MQTT broker on the AWS endpoint we defined earlier
	client.begin(AWS_IOT_ENDPOINT, 8883, net);

	// Create a message handler
	client.onMessage(messageHandler);

	Serial.print("Connecting to AWS IOT");

	while (!client.connect(THING_NAME))
	{
		Serial.print(".");
		delay(500);
		Serial.print(client.lastError());
	}

	Serial.println();
	if (!client.connected())
	{

		Serial.println("AWS IoT Timeout!");
		return;
	}

	// Subscribe to a topic
	client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);

	char pubmessage[255];
	sprintf(pubmessage, "{\"version\":\"v0.1\",\"deviceName\":\"%s\",\"mtype\":\"message\",\"message\":\"ESP32 Online\"}", THING_NAME);
	client.publish(AWS_IOT_PUBLISH_TOPIC, pubmessage);

	Serial.println("AWS IoT Connected!");
}

// ===== publish message stuff =================================================

void messageHandler(String &topic, String &payload)
{
	Serial.print("Request on: ");
	Serial.println(topic);
	if (topic == AWS_IOT_SUBSCRIBE_TOPIC)
	{
		publishMessage();
	}
}

void publishMessage()
{
	JsonDocument doc;
	alldata d = calculateAverages();
	String str = String();
	doc["version"] = "v0.1";
	doc["deviceName"] = THING_NAME;
	doc["mtype"] = "dataup";
	JsonArray sensorList;
	sensorList = doc.createNestedArray("sensorList");
	sensorList.add("BME68X");
	sensorList.add("PMSA003I");
	doc["pm10standard"] = d.pm10standard;
	doc["pm25standard"] = d.pm25standard;
	doc["pm100standard"] = d.pm100standard;
	doc["pm10env"] = d.pm10env;
	doc["pm25env"] = d.pm25env;
	doc["pm100env"] = d.pm100env;
	doc["particles03"] = d.particles03;
	doc["particles05"] = d.particles05;
	doc["particles10"] = d.particles10;
	doc["particles25"] = d.particles25;
	doc["particles50"] = d.particles50;
	doc["particles100"] = d.particles100;
	doc["temperature"] = d.temperature;
	doc["pressure"] = d.pressure;
	doc["humidity"] = d.humidity;
	serializeJson(doc, str);
	Serial.println(str);
	Serial.println("Sending doc:");
	client.publish(AWS_IOT_PUBLISH_TOPIC, str);
}

alldata calculateAverages()
{
	// init struct to zero
	alldata d;
	d.pm10standard = 0;
	d.pm25standard = 0;
	d.pm100standard = 0;
	d.pm10env = 0;
	d.pm25env = 0;
	d.pm100env = 0;
	d.particles03 = 0;
	d.particles05 = 0;
	d.particles10 = 0;
	d.particles25 = 0;
	d.particles50 = 0;
	d.particles100 = 0;
	d.temperature = 0;
	d.pressure = 0;
	d.humidity = 0;

	alldata temp;
	int length = dataqueue.itemCount();
	for (int i = 0; i < length; i++)
	{
		temp = dataqueue.dequeue();
		dataqueue.enqueue(temp);
		d.pm10standard += temp.pm10standard;
		d.pm25standard += temp.pm25standard;
		d.pm100standard += temp.pm100standard;
		d.pm10env += temp.pm10env;
		d.pm25env += temp.pm25env;
		d.pm100env += temp.pm100env;
		d.particles03 += temp.particles03;
		d.particles05 += temp.particles05;
		d.particles10 += temp.particles10;
		d.particles25 += temp.particles25;
		d.particles50 += temp.particles50;
		d.particles100 += temp.particles100;
		d.temperature += temp.temperature;
		d.pressure += temp.pressure;
		d.humidity += temp.humidity;
	}
	d.pm10standard /= length;
	d.pm25standard /= length;
	d.pm100standard /= length;
	d.pm10env /= length;
	d.pm25env /= length;
	d.pm100env /= length;
	d.particles03 /= length;
	d.particles05 /= length;
	d.particles10 /= length;
	d.particles25 /= length;
	d.particles50 /= length;
	d.particles100 /= length;
	d.temperature /= length;
	d.pressure /= length;
	d.humidity /= length;
	return d;
}

// ===== Main arduino setup function ===========================================

void setup()
{
	// Init Serial (for debug)
	Serial.begin(115200);
	while (!Serial)
		delay(10);

	Serial.println("Weather Station starting");

	// Init WiFi and AWS
	connectAWS();

	// Init sensors
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

	// setup BME oversampling
	bme.setTemperatureOversampling(BME680_OS_16X);
	bme.setHumidityOversampling(BME680_OS_16X);
	bme.setPressureOversampling(BME680_OS_16X);
	bme.setGasHeater(0, 0);
	bme.setIIRFilterSize(BME680_FILTER_SIZE_3);

	lastread = 0;

	Serial.println(" Done!");
	Serial.println("Init complete!");
}

// ===== Main arduino loop function ============================================

void loop()
{
	// Check if we should be starting sensor reads or getting sensor reads
	unsigned long now = millis();

	// if it's been READ_INTERVAL milliseconds since last read...
	if (now - lastread >= READ_INTERVAL)
	{
		lastread = millis();
		Serial.println("Starting Read");
		bme.beginReading();
		isreading = true;
	}
	else if (now - lastread >= MIN_READ_DELAY_INTERVAL && isreading)
	{
		isreading = false;
		unsigned long alsonow = millis();
		bme.endReading();
		Serial.println("Read Done!");
		aqi.read(&aqidata);
		Serial.printf("That took %li milliseconds\n", millis() - lastread);
		Serial.printf("Halted for %li milliseconds (%f percent)\n", millis() - alsonow, ((float)millis() - alsonow) / ((float)millis() - lastread));
		// Now, add data to queues
		// if they're full, pop the last result from all of them
		if (dataqueue.isFull())
		{
			dataqueue.dequeue();
		}
		// Now add the new values
		alldata d;
		d.pm10standard = aqidata.pm10_standard;
		d.pm25standard = aqidata.pm25_standard;
		d.pm100standard = aqidata.pm100_standard;
		d.pm10env = aqidata.pm10_env;
		d.pm25env = aqidata.pm25_env;
		d.pm100env = aqidata.pm100_env;
		d.particles03 = aqidata.particles_03um;
		d.particles05 = aqidata.particles_05um;
		d.particles10 = aqidata.particles_10um;
		d.particles25 = aqidata.particles_25um;
		d.particles50 = aqidata.particles_50um;
		d.particles100 = aqidata.particles_100um;
		d.temperature = bme.temperature;
		d.pressure = bme.pressure;
		d.humidity = bme.humidity;
		dataqueue.enqueue(d);
		Serial.print("Queued in elements: ");
		Serial.println(dataqueue.itemCount());
		Serial.print(d.pm25env);
		Serial.print(" PM2.5, ");
		Serial.print(d.temperature);
		Serial.print(" degs, ");
		Serial.print(d.humidity);
		Serial.print(" percent, ");
		Serial.print(d.pressure);
		Serial.println(" pressures");
		Serial.print("Getting Averages...");
		unsigned long avgstart = millis();
		d = calculateAverages();
		Serial.printf(" That took %li milliseconds\n", millis() - avgstart);
		Serial.print(d.pm25env);
		Serial.print(" PM2.5, ");
		Serial.print(d.temperature);
		Serial.print(" degs, ");
		Serial.print(d.humidity);
		Serial.print(" percent, ");
		Serial.print(d.pressure);
		Serial.println(" pressures");
	}
	// if neither of those cases, we don't need to do anything with the sensors right now.

	// do MQTT loop after dealing with sensors
	client.loop();
}
