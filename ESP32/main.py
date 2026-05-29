import network
import urequests
import ujson
import dht
from machine import Pin, ADC, I2C
import sh1106
import time

i2c = I2C(0, scl=Pin(22), sda=Pin(21))
devices = i2c.scan()

if len(devices) == 0:
    print("❌ ERROR: Screen not found! Check wiring.")
    class DummyDisplay:
        def fill(self, *args): pass
        def text(self, *args): pass
        def show(self, *args): pass
    display = DummyDisplay()
else:
    display = sh1106.SH1106_I2C(128, 64, i2c, None, devices[0])
    display.sleep(False)

air_sensor = dht.DHT11(Pin(4))
soil_power_pin = Pin(25, Pin.OUT)
soil_adc = ADC(Pin(34))
soil_adc.atten(ADC.ATTN_11DB) 

def update_screen(line1, line2="", line3="", line4=""):
    display.fill(0) 
    display.text(line1, 0, 0, 1)
    display.text(line2, 0, 16, 1)
    display.text(line3, 0, 32, 1)
    display.text(line4, 0, 48, 1)
    display.show()
    print(f"[{line1}] | [{line2}] | [{line3}] | [{line4}]")

update_screen("System Booting...", "Connecting WiFi:")
wlan = network.WLAN(network.STA_IF)
wlan.active(True)

if not wlan.isconnected():
    wlan.connect(WIFI_SSID)
    while not wlan.isconnected():
        time.sleep(0.5)

ip = wlan.ifconfig()[0]
update_screen("WiFi Connected!", f"IP: {ip}")
time.sleep(2)

while True:
    try:
        air_sensor.measure()
        temperature = air_sensor.temperature()
        air_humidity = air_sensor.humidity()
        
        soil_power_pin.value(1)       
        time.sleep(0.05)             
        soil_raw_value = soil_adc.read() 
        soil_power_pin.value(0)         
        
        soil_percentage = int(((4095 - soil_raw_value) / 4095) * 100)
        soil_percentage = max(0, min(100, soil_percentage))
        
        update_screen(
            f"Temp: {temperature} C",
            f"Air Hum: {air_humidity}%",
            f"Soil Hum: {soil_percentage}%",
            "Sending data..."
        )
        
        payload = {
            "temp": temperature,
            "humidity": air_humidity,
            "soil_moisture": soil_percentage
        }
        
        response = urequests.post(
            API_URL, 
            headers={'content-type': 'application/json'}, 
            data=ujson.dumps(payload)
        )
        
        if response.status_code == 200:
            display.fill_rect(0, 48, 128, 16, 0)
            display.text("Sent OK!", 0, 48, 1)
            display.show()
        
        response.close() 
        
    except Exception as e:
        print("Error in main loop:", e)
        update_screen("Error occurred!", str(e)[:15])
        
    time.sleep(5)