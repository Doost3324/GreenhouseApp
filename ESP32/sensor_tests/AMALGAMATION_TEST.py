from machine import Pin, ADC, I2C
import dht
import sh1106
import time

print("Booting Full Sensor Test...")

# OLED
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
display = sh1106.SH1106_I2C(128, 64, i2c, None, addr=0x3C)

# DHT11
air_sensor = dht.DHT11(Pin(4))

# Soil
soil_power = Pin(25, Pin.OUT)

soil_adc = ADC(Pin(34))
soil_adc.atten(ADC.ATTN_11DB)

temperature = 0
humidity = 0

while True:

    # DHT11
    try:
        air_sensor.measure()
        temperature = air_sensor.temperature()
        humidity = air_sensor.humidity()

    except Exception as e:
        print("DHT Error:", e)

    # Soil
    soil_power.value(1)
    time.sleep(0.05)

    soil_raw = soil_adc.read()

    soil_power.value(0)

    soil_percent = int(((4095 - soil_raw) / 4095) * 100)
    soil_percent = max(0, min(100, soil_percent))

    # Serial output
    print("----------------")
    print("Temp:", temperature)
    print("Humidity:", humidity)
    print("Soil Raw:", soil_raw)
    print("Soil %:", soil_percent)

    # OLED
    display.fill(0)

    display.text(f"Temp:{temperature}C", 0, 0)
    display.text(f"Hum :{humidity}%", 0, 20)
    display.text(f"Soil:{soil_percent}%", 0, 40)

    display.show()

    time.sleep(2)