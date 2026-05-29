"""
HTTP-маршрути API Greenhouse.
"""
from flask import Blueprint, jsonify, request

from . import config
from .storage import read_live_sensors, write_live_sensors, write_device_command
from .storage import read_live_sensors, write_live_sensors, write_device_command, read_sensor_history

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/data', methods=['GET'])
def get_live_data():
    """
    Поточні показники датчиків.
    Відповідь JSON: temp, humidity, soil_moisture, light (рядки).
    """
    data = read_live_sensors()
    if data is None:
        return jsonify({'error': 'Помилка доступу до бази даних'}), 500
    return jsonify(data)


@api.route('/history', methods=['GET'])
def get_history_data():
    """
    Історичні дані для графіків.
    Відповідь JSON: масиви labels, temperature, humidity, soilMoisture, light.
    """
    data = read_sensor_history()
    if data is None:
        return jsonify({'error': 'Помилка доступу до бази даних'}), 500
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
        # БД використовує INSERT, тому нам не треба зчитувати попередні дані
        write_live_sensors(payload)
        return jsonify({'status': 'success', 'message': 'Дані успішно збережено в БД!'}), 200
    except Exception as err:
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
            'message': f'Команду {device}={state} записано в БД'
        }), 200
    except Exception as err:
        return jsonify({'error': str(err)}), 500