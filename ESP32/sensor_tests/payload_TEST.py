import network
import urequests
import ujson
import time

SSID = "--"
PASSWORD = "---"

API_URL = "http://192.168.1.18:5000/api/update" #home

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

print("Connecting...")

wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    time.sleep(1)

print("Connected")
print(wlan.ifconfig())

payload = {
    "temp": 25,
    "humidity": 50,
    "soil_moisture": 75
}

response = urequests.post(
    API_URL,
    headers={"Content-Type": "application/json"},
    data=ujson.dumps(payload)
)

print(response.status_code)
print(response.text)

response.close()