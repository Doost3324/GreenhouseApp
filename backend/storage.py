"""
Логіка роботи з базою даних PostgreSQL.
"""
import psycopg2

# Налаштування підключення до бази даних
DB_CONFIG = {
    "dbname": "greenhouse_db",
    "user": "postgres",
    "password": "postgres", 
    "host": "localhost",
    "port": "5433"
}

def get_db_connection():
    """Допоміжна функція для створення з'єднання з БД"""
    return psycopg2.connect(**DB_CONFIG)

def init_db():
    """Створює необхідні таблиці в БД, якщо вони ще не існують"""
    init_sql = """
    CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        sensor_name VARCHAR(50) NOT NULL,
        value NUMERIC(10, 2) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_sensor_data_lookup ON sensor_data (sensor_name, timestamp DESC);

    CREATE TABLE IF NOT EXISTS device_commands (
        id SERIAL PRIMARY KEY,
        device_name VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(init_sql)
        conn.commit()
        print("Базу даних успішно перевірено/ініціалізовано.")
    except Exception as e:
        print(f"Помилка ініціалізації бази даних: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()

def read_live_sensors():
    """Витягує найсвіжіші показники для кожного датчика з БД"""
    data = {}
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
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
            if value % 1 == 0:
                data[sensor_name] = str(int(value))
            else:
                data[sensor_name] = str(value)
        return data
    except Exception as e:
        print(f"Помилка читання з БД: {e}")
        return None  # Повертаємо None, щоб routes.py знав про помилку
    finally:
        if conn:
            cursor.close()
            conn.close()

def write_live_sensors(payload):
    """Записує нові показники в БД. Зберігає історію змін."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = "INSERT INTO sensor_data (sensor_name, value) VALUES (%s, %s)"
        
        for key, value in payload.items():
            try:
                numeric_value = float(value)
                cursor.execute(insert_query, (key, numeric_value))
            except ValueError:
                print(f"Пропущено значення {key}={value}, оскільки це не число.")
                
        conn.commit()
    except Exception as e:
        print(f"Помилка запису в БД: {e}")
        if conn:
            conn.rollback()
        raise e  # Прокидаємо помилку далі у routes.py
    finally:
        if conn:
            cursor.close()
            conn.close()

def write_device_command(device, state):
    """Записує команду керування пристроєм у БД"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = "INSERT INTO device_commands (device_name, state) VALUES (%s, %s)"
        cursor.execute(insert_query, (device, state))
        conn.commit()
    except Exception as e:
        print(f"Помилка запису команди: {e}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            cursor.close()
            conn.close()    


def read_sensor_history(limit=20):
    """Витягує історичні масиви даних для побудови графіків на фронтенді"""
    data = {
        "labels": [], 
        "temperature": [], 
        "humidity": [], 
        "soilMoisture": [], 
        "light": []
    }
    
    # Відповідність назв у базі даних до назв у твоєму JS
    key_map = {
        "temp": "temperature",
        "humidity": "humidity",
        "soil_moisture": "soilMoisture",
        "light": "light"
    }
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for db_key, js_key in key_map.items():
            # Беремо останні записи для конкретного датчика
            cursor.execute("""
                SELECT value, to_char(timestamp, 'HH24:MI') as time 
                FROM sensor_data 
                WHERE sensor_name = %s 
                ORDER BY timestamp DESC 
                LIMIT %s
            """, (db_key, limit))
            rows = cursor.fetchall()
            
            # Перевертаємо, щоб найстаріший час був зліва на графіку, а найновіший - справа
            rows.reverse()
            
            # Записуємо значення в масив
            data[js_key] = [float(r[0]) for r in rows]
            
            # Беремо мітки часу (labels) з температурного датчика як основу
            if db_key == "temp":
                data["labels"] = [r[1] for r in rows]
                
        return data
    except Exception as e:
        print(f"Помилка читання історії з БД: {e}")
        return None
    finally:
        if conn:
            cursor.close()
            conn.close()