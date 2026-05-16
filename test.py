import dht
from machine import Pin
import time

sensor = dht.DHT11(Pin(4))

while True:
    try:
        sensor.measure()
        
        temp = sensor.temperature()
        hum = sensor.humidity()
        
        print(f"Temperature: {temp:.1f}°C  |  Humidity: {hum:.1f}%")
        
    except OSError as e:
        print("Failed to read sensor")
    time.sleep(2)