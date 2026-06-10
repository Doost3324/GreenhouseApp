from machine import Pin, ADC, I2C
import sh1106
import time

print("Booting Soil + OLED Test...")

# OLED
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
display = sh1106.SH1106_I2C(128, 64, i2c, None, addr=0x3C)

# Soil
soil_power = Pin(25, Pin.OUT)

soil_adc = ADC(Pin(34))
soil_adc.atten(ADC.ATTN_11DB)

while True:

    soil_power.value(1)
    time.sleep(0.05)

    raw = soil_adc.read()

    soil_power.value(0)

    percent = int(((4095 - raw) / 4095) * 100)
    percent = max(0, min(100, percent))

    print(f"Raw: {raw}")
    print(f"Soil: {percent}%")

    display.fill(0)
    display.text("SOIL TEST", 0, 0)
    display.text(f"Raw:{raw}", 0, 20)
    display.text(f"Soil:{percent}%", 0, 40)
    display.show()

    time.sleep(2)