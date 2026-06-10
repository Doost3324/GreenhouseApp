from machine import Pin, I2C
import dht
import sh1106
import time

print("Booting DHT11 + OLED Test...")

# OLED
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
display = sh1106.SH1106_I2C(128, 64, i2c, None, addr=0x3C)

# DHT11
sensor = dht.DHT11(Pin(4))

temp = 0
hum = 0

while True:
    try:
        sensor.measure()
        temp = sensor.temperature()
        hum = sensor.humidity()

        print(f"Temp: {temp}C")
        print(f"Humidity: {hum}%")

    except Exception as e:
        print("DHT Error:", e)

    display.fill(0)
    display.text("DHT11 TEST", 0, 0)
    display.text(f"Temp: {temp} C", 0, 20)
    display.text(f"Hum : {hum} %", 0, 40)
    display.show()

    time.sleep(2)