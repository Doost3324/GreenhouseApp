from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/data')
def get_data():
    data = {}
    try:
        with open('data.txt', 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    data[key.strip()] = value.strip()
    except FileNotFoundError:
        return jsonify({"error": "Файл data.txt не знайдено"}), 404
    
    return jsonify(data)

#API [data receiver]
@app.route('/api/update', methods=['POST'])
def update_data():
    try:
        # ESP32 -> JSON
        incoming_data = request.get_json()
        if not incoming_data:
            return jsonify({"error": "No JSON payload"}), 400

        # 1. Read the existing data first (so we don't accidentally delete soil_moisture)
        existing_data = {}
        try:
            with open('data.txt', 'r', encoding='utf-8') as f:
                for line in f:
                    if '=' in line:
                        key, value = line.strip().split('=', 1)
                        existing_data[key.strip()] = value.strip()
        except FileNotFoundError:
            pass

        if 'temp' in incoming_data:
            existing_data['temp'] = str(incoming_data['temp'])
        if 'humidity' in incoming_data:
            existing_data['humidity'] = str(incoming_data['humidity'])

        with open('data.txt', 'w', encoding='utf-8') as f:
            for key, value in existing_data.items():
                f.write(f"{key}={value}\n")

        return jsonify({"status": "success", "message": "Дані оновлено!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/command', methods=['POST'])
def send_command():
    req_data = request.json
    device = req_data.get('device')
    state = req_data.get('state')
    
    with open('command.txt', 'w', encoding='utf-8') as f:
        f.write(f"{device}={state}\n")
        
    print(f"Отримано команду: {device} -> {state}")
    return jsonify({"status": "success", "message": f"Команду {device}={state} записано"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)