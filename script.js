async function fetchMetrics() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        document.getElementById('val-temp').innerText = data.temp || '--';
        document.getElementById('val-hum').innerText = data.humidity || '--';
        document.getElementById('val-soil').innerText = data.soil_moisture || '--';

        checkStatus(data);
    } catch (error) {
        console.error("Помилка отримання даних:", error);
    }
}

function checkStatus(data) {
    const badge = document.getElementById('status-badge');
    let isWarning = false;
    let msg = "";

    if (parseFloat(data.temp) > 28) { isWarning = true; msg = "Критична температура!"; }
    else if (parseFloat(data.soil_moisture) < 30) { isWarning = true; msg = "Низький рівень вологи!"; }

    if (isWarning) {
        badge.className = 'status-badge warning';
        badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
    } else {
        badge.className = 'status-badge ok';
        badge.innerHTML = `<i class="fa-solid fa-check"></i> Всі системи в нормі`;
    }
}

setInterval(fetchMetrics, 2000);
fetchMetrics();


const deviceStates = {
    fan: false,
    pump: false,
    light: false
};

async function toggleDevice(device) {
    deviceStates[device] = !deviceStates[device];
    const newState = deviceStates[device] ? 'on' : 'off';
    
    const btn = document.getElementById(`btn-${device}`);
    if (deviceStates[device]) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }

    try {
        const response = await fetch('/api/command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ device: device, state: newState })
        });
        
        const result = await response.json();
        console.log(result.message); 
    } catch (error) {
        console.error("Помилка відправки команди:", error);
    }
}

function selectPlant(plantId) {
    document.querySelectorAll('.plant-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('current-plant-name').innerText = event.target.innerText.split(' (')[0];
}