from machine import Pin
import dht
import time

sensor = dht.DHT11(Pin(4))

while True:
    try:
        sensor.measure()

        temp = sensor.temperature()
        hum = sensor.humidity()

        print("Temp:", temp)
        print("Humidity:", hum)

    except Exception as e:
        print("Error:", e)

    time.sleep(2)