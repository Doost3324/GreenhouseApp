#WORKING Screen TEST

from machine import Pin, I2C
import sh1106
import time

print("Booting Screen Test...")
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
devices = i2c.scan()

print(f"I2C Devices found: {[hex(d) for d in devices]}")

if 0x3C in devices:
    print("Screen found at 0x3c.")
    display = sh1106.SH1106_I2C(128, 64, i2c, None, addr=0x3C)
    display.fill(0)
    display.text("Doofus", 25, 25, 1)
    display.show()
else:
    print("Failed[Screen not on the IC2 bus]")