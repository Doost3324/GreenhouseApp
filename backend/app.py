"""
Фабрика Flask-додатку Greenhouse.
"""
from flask import Flask, send_from_directory

from . import config
from .routes import api
from .storage import init_db  # Імпортуємо ініціалізатор БД

def create_app() -> Flask:
    """
    Створює налаштований Flask-додаток.
    - Статика з кореня проєкту (index.html, css, js, …)
    - API під префіксом /api
    """
    app = Flask(__name__, static_folder=config.BASE_DIR, static_url_path='')

    # Запускаємо перевірку та створення таблиць у БД при старті
    init_db()

    @app.route('/')
    def index():
        return send_from_directory(config.BASE_DIR, 'index.html')

    app.register_blueprint(api)
    return app