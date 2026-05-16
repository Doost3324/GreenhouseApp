from flask import Flask, request, jsonify, send_from_directory
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LIVE_DATA_FILE = os.path.join(BASE_DIR, 'data', 'live.txt')
LEGACY_DATA_FILE = os.path.join(BASE_DIR, 'data.txt')
COMMAND_FILE = os.path.join(BASE_DIR, 'command.txt')

app = Flask(__name__, static_folder='.', static_url_path='')


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


def _read_live_data():
    data = {}
    for path in (LIVE_DATA_FILE, LEGACY_DATA_FILE):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    if '=' in line:
                        key, value = line.strip().split('=', 1)
                        data[key.strip()] = value.strip()
            if data:
                return data
        except FileNotFoundError:
            continue
    return None


def _write_live_data(data):
    os.makedirs(os.path.dirname(LIVE_DATA_FILE), exist_ok=True)
    with open(LIVE_DATA_FILE, 'w', encoding='utf-8') as f:
        for key, value in data.items():
            f.write(f"{key}={value}\n")


@app.route('/api/data')
def get_data():
    data = _read_live_data()
    if data is None:
        return jsonify({"error": "Файл data/live.txt не знайдено"}), 404
    return jsonify(data)


@app.route('/api/update', methods=['POST'])
def update_data():
    try:
        incoming_data = request.get_json()
        if not incoming_data:
            return jsonify({"error": "No JSON payload"}), 400

        existing_data = _read_live_data() or {}

        if 'temp' in incoming_data:
            existing_data['temp'] = str(incoming_data['temp'])
        if 'humidity' in incoming_data:
            existing_data['humidity'] = str(incoming_data['humidity'])
        if 'soil_moisture' in incoming_data:
            existing_data['soil_moisture'] = str(incoming_data['soil_moisture'])
        if 'light' in incoming_data:
            existing_data['light'] = str(incoming_data['light'])

        _write_live_data(existing_data)
        return jsonify({"status": "success", "message": "Дані оновлено!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/command', methods=['POST'])
def send_command():
    req_data = request.json
    device = req_data.get('device')
    state = req_data.get('state')

    with open(COMMAND_FILE, 'w', encoding='utf-8') as f:
        f.write(f"{device}={state}\n")

    print(f"Отримано команду: {device} -> {state}")
    return jsonify({"status": "success", "message": f"Команду {device}={state} записано"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
