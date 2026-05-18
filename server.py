"""
Точка входу сервера Greenhouse.

Запуск: python server.py
Документація API: backend/README.md
"""
from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)