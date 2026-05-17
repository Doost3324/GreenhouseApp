from flask import Flask, request, jsonify, send_from_directory
import psycopg2
import os

# 1. Ініціалізація Flask додатка
app = Flask(__name__, static_folder='.', static_url_path='')

# 2. Налаштування підключення до бази даних
DB_CONFIG = {
     "dbname": "greenhouse_db",
     "user": "postgres",
     "password": "postgres", 
     "host": "localhost",
     "port": "5432"
}

def get_db_connection():
     """Допоміжна функція для створення з'єднання з БД"""
     return psycopg2.connect(**DB_CONFIG)


# --- МАРШРУТИ (ROUTES) ---

@app.route('/')
def index():
     """Віддає головну сторінку сайту"""
     return send_from_directory('.', 'index.html')



@app.route('/api/data')
def get_data():
     """Віддає на фронтенд останні актуальні показники всіх датчиків з БД"""
     data = {}
     conn = None
     try:
         conn = get_db_connection()
         cursor = conn.cursor()
        
         # Дістаємо лише найсвіжіший запис для кожного унікального датчика
         query = """
             SELECT DISTINCT ON (sensor_name) sensor_name, value
             FROM sensor_data
             ORDER BY sensor_name, timestamp DESC;
         """
         cursor.execute(query)
         rows = cursor.fetchall()
        
         for row in rows:
             sensor_name = row[0]
             value = row[1]
             # Форматуємо число: якщо ціле — прибираємо крапку з нулем
             if value % 1 == 0:
                 data[sensor_name] = str(int(value))
             else:
                 data[sensor_name] = str(value)
                
     except Exception as e:
         print(f"Помилка читання з БД: {e}")
         return jsonify({"error": "Помилка бази даних"}), 500
     finally:
         if conn:
             cursor.close()
             conn.close()
            
     return jsonify(data)


@app.route('/api/update', methods=['POST'])
def update_data():
     """Приймає JSON від ESP32 та записує нові показники в БД"""
     try:
         incoming_data = request.get_json()
         if not incoming_data:
             return jsonify({"error": "No JSON payload"}), 400

         conn = get_db_connection()
         cursor = conn.cursor()

         # Запит для вставки даних датчиків
         insert_query = "INSERT INTO sensor_data (sensor_name, value) VALUES (%s, %s)"
        
         for key, value in incoming_data.items():
              try:
                  numeric_value = float(value)
                  cursor.execute(insert_query, (key, numeric_value))
              except ValueError:
                  print(f"Пропущено значення {key}={value}, оскільки це не число.")

         conn.commit()
         return jsonify({"status": "success", "message": "Дані успішно збережено в БД!"}), 200

     except Exception as e:
         print(f"Помилка запису в БД: {e}")
         if 'conn' in locals() and conn:
             conn.rollback()
         return jsonify({"error": str(e)}), 500
     finally:
         if 'conn' in locals() and conn:
             cursor.close()
             conn.close()


@app.route('/api/command', methods=['POST'])
def send_command():
     """Приймає команди керування від користувача та зберігає в БД"""
     req_data = request.json
     device = req_data.get('device')
     state = req_data.get('state')
    
     if not device or not state:
         return jsonify({"error": "Відсутні дані про пристрій або стан"}), 400
     conn = None
     try:
         conn = get_db_connection()
         cursor = conn.cursor()
        
         insert_query = "INSERT INTO device_commands (device_name, state) VALUES (%s, %s)"
         cursor.execute(insert_query, (device, state))
         conn.commit()
        
         print(f"Отримано команду: {device} -> {state}")
         return jsonify({"status": "success", "message": f"Команду {device}={state} записано в БД"})
        
     except Exception as e:
         print(f"Помилка запису команди: {e}")
         if conn:
             conn.rollback()
         return jsonify({"error": "Помилка бази даних"}), 500
     finally:
         if conn:
             cursor.close()
             conn.close()


# 3. Блок запуску локального сервера (взято з другого коду)
if __name__ == '__main__':
    # Сервер запуститься на порті 5000 і буде доступний для ESP32 в одній мережі Wi-Fi
    app.run(host='0.0.0.0', port=5000, debug=True)