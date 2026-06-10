from machine import Pin, ADC
import time

print("Booting Soil Sensor Test...")
soil_power = Pin(25, Pin.OUT)
soil_adc = ADC(Pin(34))
soil_adc.atten(ADC.ATTN_11DB) 

while True:
    soil_power.value(1)          
    time.sleep(0.05)                 
    raw_val = soil_adc.read() 
    soil_power.value(0)          
    
    percent = int(((4095 - raw_val) / 4095) * 100)
    percent = max(0, min(100, percent))
    
    print(f"Raw ADC: {raw_val} | Moisture: {percent}%")
    time.sleep(2)