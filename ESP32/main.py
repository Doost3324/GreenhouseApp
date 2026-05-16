import network
import urequests
import ujson
import dht
from machine import Pin
import time

API_URL = "http://192.168.1.8:5050/api/update"
WIFI_SSID = "Kalicha street"
WIFI_PASSWORD = "roman1979"
SENSOR_PIN = 4

def setup_wifi():
    """Initializes and connects to the Wi-Fi network safely."""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    
    time.sleep(1) 
    
    wlan.disconnect() 
    time.sleep(1)
    
    if not wlan.isconnected():
        print("Connecting to Wi-Fi...")
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        
        timeout = 15
        while not wlan.isconnected() and timeout > 0:
            time.sleep(1)
            print(".", end="")
            timeout -= 1
            
    if wlan.isconnected():
        print(f"\nWi-Fi Connected! IP: {wlan.ifconfig()[0]}")
        return True
    else:
        print("\nFailed to connect. Check credentials or ensure the network is 2.4GHz.")
        return False

def read_and_send_data(sensor):
    """Reads sensor data and executes the POST request."""
    try:
        sensor.measure()
        temp = sensor.temperature()
        humidity = sensor.humidity()
        
        payload = {
            "temp": temp,
            "humidity": humidity
        }
        
        print(f"Sending to server: {payload}")
        
        response = urequests.post(
            API_URL, 
            headers={'content-type': 'application/json', 'Connection': 'close'}, 
            data=ujson.dumps(payload)
        )
        
        print(f"Server Response: {response.text}")
        response.close()
        
    except OSError as e:
        print(f"Sensor read error: {e}")
    except Exception as e:
        print(f"Network or API request error: {e}")

def main():
    """Main procedural loop."""
    sensor = dht.DHT11(Pin(SENSOR_PIN))
    
    wifi_connected = setup_wifi()
    
    if not wifi_connected:
        print("Halting execution due to network failure.")
        return 
        
    while True:
        read_and_send_data(sensor)
        time.sleep(5)

main()