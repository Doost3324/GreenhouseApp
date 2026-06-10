from machine import Pin, ADC, I2C
import dht
import sh1106
import time
import network
import urequests
import ujson

print("Booting Greenhouse Test...")

#OLED

i2c = I2C(0, scl=Pin(22), sda=Pin(21))
display = sh1106.SH1106_I2C(128, 64, i2c, None, addr=0x3C)

#DHT11

air_sensor = dht.DHT11(Pin(4))

#Soil Sensor

soil_power = Pin(25, Pin.OUT)

soil_adc = ADC(Pin(34))
soil_adc.atten(ADC.ATTN_11DB)

#WiFi

SSID = "--" #home
PASSWORD = "--"

API_URL = "http://192.168.1.18:5000/api/update"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

print("Connecting to WiFi...")

wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    time.sleep(1)

print("Connected!")
print("Network config:", wlan.ifconfig())

temperature = 0
humidity = 0
soil_percent = 0

#Main Loop

while True:

    #WiFi Check

    if not wlan.isconnected():

        print("WiFi lost. Reconnecting...")

        wlan.disconnect()
        wlan.connect(SSID, PASSWORD)

        while not wlan.isconnected():
            time.sleep(1)

        print("WiFi restored.")

    #DHT11

    try:
        air_sensor.measure()
        temperature = air_sensor.temperature()
        humidity = air_sensor.humidity()

    except Exception as e:
        print("DHT Error:", e)

    #Soil sensor

    soil_power.value(1)
    time.sleep(0.05)

    soil_raw = soil_adc.read()

    soil_power.value(0)

    soil_percent = int(((4095 - soil_raw) / 4095) * 100)
    soil_percent = max(0, min(100, soil_percent))

    #Data output[testing purposes]

    print("Temp:", temperature)
    print("Humidity:", humidity)
    print("Soil Raw:", soil_raw)
    print("Soil %:", soil_percent)

    #Data Transfer

    payload = {
        "temp": temperature,
        "humidity": humidity,
        "soil_moisture": soil_percent
    }

    api_status = "POST ERR"

    try:

        response = urequests.post(
            API_URL,
            headers={"Content-Type": "application/json"},
            data=ujson.dumps(payload)
        )

        print("POST:", response.status_code)
        print(response.text)

        if response.status_code == 200:
            api_status = "POST OK"

        response.close()

    except Exception as e:

        print("POST Error:", e)

    # Screen stuff

    display.fill(0)

    display.text("GREENHOUSE", 0, 0)

    display.text(f"Temp:{temperature}C", 0, 16)
    display.text(f"Hum:{humidity}%", 64, 16)

    display.text(f"Soil%:{soil_percent}%", 0, 32)

    display.text(api_status, 0, 48)

    display.show()

    time.sleep(5)