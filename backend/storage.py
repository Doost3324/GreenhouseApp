"""
Читання / запис файлів даних (без бази даних).
"""
from . import config


def read_key_value_file(path: str) -> dict[str, str]:
    """Парсить файл формату key=value (по рядку)."""
    result: dict[str, str] = {}
    with open(path, 'r', encoding='utf-8') as handle:
        for line in handle:
            line = line.strip()
            if '=' in line:
                key, value = line.split('=', 1)
                result[key.strip()] = value.strip()
    return result


def write_key_value_file(path: str, data: dict[str, str]) -> None:
    """Записує словник у формат key=value."""
    with open(path, 'w', encoding='utf-8') as handle:
        for key, value in data.items():
            handle.write(f'{key}={value}\n')


def read_live_sensors() -> dict[str, str] | None:
    """
    Показники з data/live.txt або запасного data.txt.
    Повертає None, якщо жодного файлу немає.
    """
    for path in (config.LIVE_DATA_FILE, config.LEGACY_DATA_FILE):
        try:
            data = read_key_value_file(path)
            if data:
                return data
        except FileNotFoundError:
            continue
    return None


def write_live_sensors(data: dict[str, str]) -> None:
    """Зберігає показники в data/live.txt."""
    import os
    os.makedirs(os.path.dirname(config.LIVE_DATA_FILE), exist_ok=True)
    write_key_value_file(config.LIVE_DATA_FILE, data)


def write_device_command(device: str, state: str) -> None:
    """Записує команду для ESP32 у command.txt."""
    write_key_value_file(config.COMMAND_FILE, {device: state})
