#include <MatrizLed.h>
#include <driver/i2s.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiMulti.h>

#include <HTTPClient.h>

// ADC A7
// MOTOR A6

#define I2S_SAMPLE_RATE 78125
#define ADC_INPUT ADC1_CHANNEL_4 //pin 32
#define OUTPUT_PIN 27
#define OUTPUT_VALUE 3800
#define READ_DELAY 9000 //microseconds

#define DELAY 500

#define SENSOR "id03"
#define MATRIZ1 "id02"
#define MOTOR "id01"

#define WIFISSID "IoT_CCVIII"
#define PASSWORD "UniversidadGalileoCC8"
#define URL "http://192.168.0.112/request.json?id="

int sensor_freq = 5000;
int matriz_freq = 5000;
int motor_freq = 5000;

int sensor_value;
bool matriz_status = false;
String matriz_text = "vacio";
bool motor_status = false;
String motor_text = "vacio";

int sensor_cont = 0;
int matriz_cont = 0;
int motor_cont = 0;

uint16_t adc_reading;

const int ledPin = 14;
const int freq = 5000;
const int ledChannel = 5;
const int resolution = 8;

WiFiMulti wifiMulti;
StaticJsonDocument<100> response;
MatrizLed pantalla;

void i2sInit()
{
   i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX | I2S_MODE_ADC_BUILT_IN),
    .sample_rate =  I2S_SAMPLE_RATE,              // The format of the signal using ADC_BUILT_IN
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT, // is fixed at 12bit, stereo, MSB
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = I2S_COMM_FORMAT_I2S_MSB,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = 8,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
   };
   i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
   i2s_set_adc_mode(ADC_UNIT_1, ADC_INPUT);
   i2s_adc_enable(I2S_NUM_0);
}

void reader(void *pvParameters) {
  uint32_t read_counter = 0;
  uint64_t read_sum = 0;
// The 4 high bits are the channel, and the data is inverted
  uint16_t offset = (int)ADC_INPUT * 0x1000 + 0xFFF;
  size_t bytes_read;
  while(1){
    uint16_t buffer[2] = {0};
    i2s_read(I2S_NUM_0, &buffer, sizeof(buffer), &bytes_read, 15);
    if (bytes_read == sizeof(buffer)) {
      read_sum += offset - buffer[0];
      read_sum += offset - buffer[1];
      read_counter++;
    } else {
      Serial.println("buffer empty");
    }
    if (read_counter == I2S_SAMPLE_RATE) {
      adc_reading = read_sum / I2S_SAMPLE_RATE / 2;
      read_counter = 0;
      read_sum = 0;
      i2s_adc_disable(I2S_NUM_0);
      delay(READ_DELAY);
      i2s_adc_enable(I2S_NUM_0);
    }
  }
}

void send_request(bool type, int request_freq, int value, bool status, String text, String id){
  HTTPClient http;
  Serial.print("[HTTP] begin...\n");

  if(type){
    http.begin(URL+id+"&type=true&frequency="+String(request_freq)+"&sensor="+String(value));
  }else{
    http.begin(URL+id+"&type=false&frequency="+String(request_freq)+"&status="+((status)?"true":"false")+"&text="+text);
  }
  
  Serial.print("[HTTP] GET...\n");
  
  int httpCode = http.GET();

  if(httpCode > 0) {
      Serial.printf("[HTTP] GET... code: %d\n", httpCode);

      if(httpCode == HTTP_CODE_OK) {
          String payload = http.getString();
          DeserializationError err = deserializeJson(response, payload);
          Serial.println(id);
          Serial.println(payload);
          if(err){
            Serial.print("deserializeJson failed, code: ");
            Serial.print("err.c_str()");
          }
          else{
            if(id.equals(SENSOR)){
             sensor_freq = response["frequency"].as<int>();
            }else if(id.equals(MATRIZ1)){
              matriz_freq = response["frequency"].as<int>();
              matriz_status = response["status"].as<bool>();
              matriz_text = response["text"].as<String>();
              if(matriz_text.equals("")){
                matriz_text = "vacio";
              }
            }else if(id.equals(MOTOR)){
              motor_freq = response["frequency"].as<int>();
              motor_status = response["status"].as<bool>();
              motor_text = response["text"].as<String>();
              if(motor_text.equals("")){
                motor_text = "vacio";
              }
            }
          }
      }
  } else {
      Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void setup() {

    Serial.begin(115200);

    Serial.println();
    Serial.println();
    Serial.println();
    pantalla.begin(16, 21, 17, 1);

    ledcSetup(ledChannel, freq, resolution);
    ledcAttachPin(ledPin, ledChannel);

    uint32_t freq = ledcSetup(0, I2S_SAMPLE_RATE, 10);

    Serial.printf("Output frequency: %d\n", freq);
    ledcWrite(0, OUTPUT_VALUE/4);
    ledcAttachPin(OUTPUT_PIN, 0);
    // Initialize the I2S peripheral
    i2sInit();
    // Create a task that will read the data
    xTaskCreatePinnedToCore(reader, "ADC_reader", 2048, NULL, 1, NULL, 1);
    
    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }

    wifiMulti.addAP(WIFISSID, PASSWORD);

}

void loop() {
    // wait for WiFi connection
    if((wifiMulti.run() == WL_CONNECTED)) {

        if(sensor_cont <= 0){
          Serial.printf("ADC reading: %d\n", adc_reading);
          sensor_value = adc_reading / 2;
          send_request(true, sensor_freq, sensor_value, false, "", SENSOR);
          sensor_cont = sensor_freq / DELAY;
        }

        if(matriz_cont <= 0){
          send_request(false, matriz_freq, 0, matriz_status, matriz_text, MATRIZ1);
          matriz_cont = matriz_freq / DELAY;
          //Escribir en la matriz
          if(matriz_status){
            char mensaje[sizeof(matriz_text)];
            matriz_text.toCharArray(mensaje, sizeof(mensaje));
            pantalla.escribirFrase(mensaje);
          }else{
            pantalla.borrar();
          }
        }

        if(motor_cont <= 0){
          send_request(false, motor_freq, 0, motor_status, motor_text, MOTOR);
          motor_cont = motor_freq / DELAY;
          //Cambiar Velocidad
          //ledcWrite(ledChannel, velocidad);
          if(motor_status){
            ledcWrite(ledChannel, motor_text.toInt());
          }else{
            ledcWrite(ledChannel, 0);
          }
        }
    }
    else
    {
      Serial.println("no conecto");
    }

    delay(DELAY);
    sensor_cont--;
    matriz_cont--;
    motor_cont--;
}
