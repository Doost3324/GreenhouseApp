# Використовуємо офіційний легкий образ Python
FROM python:3.10-slim

# Встановлюємо робочу папку всередині контейнера
WORKDIR /app

# Копіюємо файл із залежностями в контейнер
COPY requirements.txt .

# Встановлюємо Flask та інші пакети всередині контейнера
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо всі інші файли вашого проєкту (server.py, index.html, data.txt тощо)
COPY . .

# Відкриваємо порт 5000 (стандартний для Flask)
EXPOSE 5000

# Команда для запуску вашого сервера
CMD ["python", "server.py"]