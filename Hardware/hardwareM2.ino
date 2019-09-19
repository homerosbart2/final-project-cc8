#include <MatrizLed.h>
#include <driver/i2s.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiMulti.h>

#include <HTTPClient.h>

#define I2S_SAMPLE_RATE 78125
#define ADC_INPUT ADC1_CHANNEL_4 //pin 32
#define OUTPUT_PIN 27
#define OUTPUT_VALUE 3800
#define READ_DELAY 9000 //microseconds

/*uint16_t adc_reading;
uint8_t velocidad = 0;
int numeroDesplegado = 0;

float Vin=3.3;     // [V]        
float Rt=10000;    // Resistor t [ohm]
float R0=10000;    // value of rct in T0 [ohm]
float temp0=298.15;   // use T0 in Kelvin [K]
float Vout=0.0;    // Vout in A0 
float Rout=0.0;    // Rout in A0
// use the datasheet to get this data.
float temp1=273.15;      // [K] in datasheet 0º C
float temp2=373.15;      // [K] in datasheet 100° C
float RT1=35563;   // [ohms]  resistence in T1
float RT2=549;    // [ohms]   resistence in T2
float beta=0.0;    // initial parameters [K]
float Rinf=0.0;    // initial parameters [ohm]   
float TempK=0.0;   // variable output
float TempC=0.0;   // variable output*/

WiFiMulti wifiMulti;
StaticJsonDocument<100> response;
MatrizLed pantalla;

int numeroDesplegado = 0;
/*
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
    //Serial.printf("%d  %d\n", offset - buffer[0], offset - buffer[1]);
    if (bytes_read == sizeof(buffer)) {
      read_sum += offset - buffer[0];
      read_sum += offset - buffer[1];
      read_counter++;
    } else {
      Serial.println("buffer empty");
    }
    if (read_counter == I2S_SAMPLE_RATE) {
      adc_reading = read_sum / I2S_SAMPLE_RATE / 2;
      //Serial.printf("avg: %d millis: ", adc_reading);
      //Serial.println(millis());
      read_counter = 0;
      read_sum = 0;
      i2s_adc_disable(I2S_NUM_0);
      delay(READ_DELAY);
      i2s_adc_enable(I2S_NUM_0);
    }
  }
}
*/
void setup() {

    Serial.begin(115200);

    Serial.println();
    Serial.println();
    Serial.println();
    pantalla.begin(16, 21, 17, 1);

    //beta=(log(RT1/RT2))/((1/temp1)-(1/temp2));
    //Rinf=R0*exp(-beta/temp0);

    //uint32_t freq = ledcSetup(0, I2S_SAMPLE_RATE, 10);

    //Serial.printf("Output frequency: %d\n", freq);
    //ledcWrite(0, OUTPUT_VALUE/4);
    //ledcAttachPin(OUTPUT_PIN, 0);
    // Initialize the I2S peripheral
    //i2sInit();
    // Create a task that will read the data
    //xTaskCreatePinnedToCore(reader, "ADC_reader", 2048, NULL, 1, NULL, 1);
    
    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }

    wifiMulti.addAP("JJJ", "znph6048");

}

void loop() {
    // wait for WiFi connection
    if((wifiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;

        //Serial.printf("ADC reading: %d\n", adc_reading);

        //Vout=Vin*((float)(adc_reading)/4096.0); // calc for ntc
        //Rout=(Rt*Vout/(Vin-Vout));
      
        //TempK=(beta/log(Rout/Rinf))-2.0; // calc for temperature
        //TempC=TempK-273.15;
      
        //Serial.printf("Temperature: %.2f C \n\n", TempC);

        Serial.print("[HTTP] begin...\n");
        // configure traged server and url
        http.begin("http://192.168.43.186/request.json?m2="+String(numeroDesplegado));
        Serial.print("[HTTP] GET...\n");
        // start connection and send HTTP header
        int httpCode = http.GET();

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            Serial.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                String payload = http.getString();
                DeserializationError err = deserializeJson(response, payload);
                if(err){
                  Serial.print("deserializeJson failed, code: ");
                  Serial.print("err.c_str()");
                }
                else{
                  //Serial.print("Velocidad: ");
                  //velocidad = response["motor_speed"].as<int>();
                  //Serial.println(velocidad);
                  numeroDesplegado = response["m2"].as<int>();
                  pantalla.borrar();
                  pantalla.escribirCifra(numeroDesplegado);
                }
                Serial.println(payload);
            }
        } else {
            Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        http.end();
    }
    else
    {
      Serial.println("no conecto");
    }

    delay(5000);
}
