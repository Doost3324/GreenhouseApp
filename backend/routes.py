"""
HTTP-маршрути API Greenhouse.
"""
from flask import Blueprint, jsonify, request

from . import config
from .storage import read_live_sensors, write_live_sensors, write_device_command

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/data', methods=['GET'])
def get_live_data():
    """
    Поточні показники датчиків.

    Відповідь JSON: temp, humidity, soil_moisture, light (рядки).
  """
    data = read_live_sensors()
    if data is None:
        return jsonify({'error': 'Файл з показниками не знайдено'}), 404
    return jsonify(data)


@api.route('/update', methods=['POST'])
def update_live_data():
    """
    Оновлення показників (наприклад, з ESP32).

    Тіло JSON — будь-який набір: temp, humidity, soil_moisture, light.
    """
    payload = request.get_json()
    if not payload:
        return jsonify({'error': 'Порожнє тіло запиту'}), 400

    try:
        existing = read_live_sensors() or {}
        for key in config.LIVE_KEYS:
            if key in payload:
                existing[key] = str(payload[key])
        write_live_sensors(existing)
        return jsonify({'status': 'success', 'message': 'Дані оновлено'}), 200
    except OSError as err:
        return jsonify({'error': str(err)}), 500


@api.route('/command', methods=['POST'])
def post_command():
    """
    Команда керування: вентилятор, полив, світло.

    Тіло JSON: { "device": "fan"|"pump"|"light", "state": "on"|"off" }
    """
    payload = request.get_json() or {}
    device = payload.get('device')
    state = payload.get('state')

    if device not in config.DEVICES:
        return jsonify({'error': f'Невідомий пристрій: {device}'}), 400
    if state not in config.DEVICE_STATES:
        return jsonify({'error': f'Невідомий стан: {state}'}), 400

    try:
        write_device_command(device, state)
        return jsonify({
            'status': 'success',
            'message': f'Команду {device}={state} записано'
        }), 200
    except OSError as err:
        return jsonify({'error': str(err)}), 500
