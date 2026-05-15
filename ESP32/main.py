import network
import urequests
import ujson
import dht
from machine import Pin
import time

WIFI_SSID = "LNU-Guest"
API_URL = "http://172.16.206.167/18:5000/api/update" 

sensor = dht.DHT11(Pin(4))

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
if not wlan.isconnected():
    print("Connecting to Wi-Fi...")
    wlan.connect(WIFI_SSID)
    while not wlan.isconnected():
        time.sleep(0.5)
        print(".", end="")
print("\nWi-Fi Connected! IP:", wlan.ifconfig()[0])

while True:
    try:
        sensor.measure()
        
        payload = {
            "temp": sensor.temperature(),
            "humidity": sensor.humidity()
        }
        
        print("Sending to server:", payload)
        
        response = urequests.post(
            API_URL, 
            headers={'content-type': 'application/json'}, 
            data=ujson.dumps(payload)
        )
        
        print("Server Response:", response.text)
        response.close() 
        
    except Exception as e:
        print("Error:", e)
        
    time.sleep(5)