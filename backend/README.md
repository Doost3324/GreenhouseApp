# Backend Greenhouse

Простий Flask-сервер без бази даних: показники та команди зберігаються у файлах.

## Запуск

```bash
python server.py
```

Сервер: `http://0.0.0.0:5000`

## Файли

| Файл | Призначення |
|------|-------------|
| `data/live.txt` | Поточні показники датчиків |
| `data/mock-history.json` | Історія для графіків (фронтенд) |
| `command.txt` | Остання команда для ESP32 |

Формат `live.txt` і `command.txt`:

```
temp=25
humidity=66
soil_moisture=45
light=850
```

## API

### `GET /api/data`

Поточні показники.

### `POST /api/update`

Оновити показники (частково). JSON:

```json
{ "temp": 24.5, "humidity": 60, "soil_moisture": 42, "light": 900 }
```

### `POST /api/command`

Керування пристроями. JSON:

```json
{ "device": "pump", "state": "on" }
```

`device`: `fan` | `pump` | `light`  
`state`: `on` | `off`

## Структура коду

- `config.py` — шляхи та константи
- `storage.py` — робота з файлами
- `routes.py` — маршрути API
- `app.py` — збірка Flask-додатку
