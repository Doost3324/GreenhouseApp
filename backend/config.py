"""
Шляхи та константи сервера Greenhouse.
"""
import os

# Корінь проєкту (папка GreenhouseApp)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Файли даних
LIVE_DATA_FILE = os.path.join(BASE_DIR, 'data', 'live.txt')
LEGACY_DATA_FILE = os.path.join(BASE_DIR, 'data.txt')
COMMAND_FILE = os.path.join(BASE_DIR, 'command.txt')

# Дозволені ключі в live.txt
LIVE_KEYS = ('temp', 'humidity', 'soil_moisture', 'light')

# Дозволені пристрої для command.txt
DEVICES = ('fan', 'pump', 'light')
DEVICE_STATES = ('on', 'off')
