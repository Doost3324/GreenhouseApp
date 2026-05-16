/** Глобальні налаштування застосунку */
export const CONFIG = {
    metricsPollMs: 3000,
    /** Люкс → % для відображення освітленості */
    lightLuxMax: 1000,
    plantModelUrl: 'models/plant/potted_plant.glb',
    mockHistoryUrl: 'data/mock-history.json',
    defaults: {
        temp: 24,
        humidity: 62,
        soilMoisture: 45,
        lightLux: 850
    }
};
