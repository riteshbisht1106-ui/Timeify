// ==========================================
// TIMEIFY 2.0 - COMPLETE JAVASCRIPT
// ==========================================


// ==========================================
// 1. NAVIGATION
// ==========================================

let alarmbtn = document.getElementById('alarmbtn');
let worldbtn = document.getElementById('worldbtn');
let stopwatchbtn = document.getElementById('stopwatchbtn');
let timerbtn = document.getElementById('timerbtn');

let alarm = document.getElementById('alarm');
let worldclock = document.getElementById('worldclock');
let stopwatch = document.getElementById('stopwatch');
let timer = document.getElementById('timer');

let pagetitle = document.getElementById('pagetitle');
let navbuttons = document.querySelectorAll('.nav-btn');

function hideallpages() {
    alarm.style.display = "none";
    worldclock.style.display = "none";
    stopwatch.style.display = "none";
    timer.style.display = "none";
}

function setactivebutton(activebutton) {
    navbuttons.forEach(function(button) {
        button.classList.remove('active');
    });

    activebutton.classList.add('active');
}

alarmbtn.addEventListener('click', function() {
    hideallpages();
    alarm.style.display = "block";
    setactivebutton(alarmbtn);
    pagetitle.textContent = "Alarm";
});

worldbtn.addEventListener('click', function() {
    hideallpages();
    worldclock.style.display = "block";
    setactivebutton(worldbtn);
    pagetitle.textContent = "World Clock";
});

stopwatchbtn.addEventListener('click', function() {
    hideallpages();
    stopwatch.style.display = "block";
    setactivebutton(stopwatchbtn);
    pagetitle.textContent = "Stopwatch";
});

timerbtn.addEventListener('click', function() {
    hideallpages();
    timer.style.display = "block";
    setactivebutton(timerbtn);
    pagetitle.textContent = "Timer";
});

hideallpages();
alarm.style.display = "block";
setactivebutton(alarmbtn);


// ==========================================
// 2. DIGITAL CLOCK
// ==========================================

function updateclock() {
    let now = new Date();

    let day = now.getDate();

    let month = now.toLocaleString('en-US', {
        month: 'long'
    });

    let year = now.getFullYear();

    document.getElementById('currentdate').textContent =
        `${day} ${month} ${year}`;

    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('digitaltime').textContent =
        `${hours}:${minutes}:${seconds}`;
}

updateclock();
setInterval(updateclock, 1000);


// ==========================================
// 3. ALARM SECTION
// ==========================================

let addalarmbtn = document.getElementById('addalarmbtn');
let alarmform = document.getElementById('alarmform');
let cancelalarm = document.getElementById('cancelalarm');
let savealarm = document.getElementById('savealarm');
let alarmtime = document.getElementById('alarmtime');
let alarmlist = document.getElementById('alarmlist');

let alarmsound = document.getElementById('alarmsound');

let ringingpopup = document.getElementById('ringingpopup');
let ringingtime = document.getElementById('ringingtime');
let ringingtitle = document.getElementById('ringingtitle');

let snoozebtn = document.getElementById('snoozebtn');
let dismissbtn = document.getElementById('dismissbtn');

let editindex = null;
let activeAlarmId = null;
let snoozeTimeout = null;
let snoozedAlarmId = null;

let lastTriggered = new Set();

// Timer state
let isTimerRinging = false;


// Load alarms from LocalStorage

let alarms = [];

try {
    alarms = JSON.parse(localStorage.getItem("alarms")) || [];

    alarms.forEach(function(item) {
        if (!item.id) {
            item.id = Date.now() + Math.random();
        }

        if (typeof item.active !== "boolean") {
            item.active = true;
        }
    });

    localStorage.setItem("alarms", JSON.stringify(alarms));

} catch (error) {
    console.error("Unable to load alarms:", error);
    alarms = [];
}


// Save alarms

function saveToLocalStorage() {
    localStorage.setItem("alarms", JSON.stringify(alarms));
}


// Open alarm form

addalarmbtn.addEventListener('click', function() {
    editindex = null;
    alarmtime.value = "";
    alarmform.style.display = "block";
});


// Cancel alarm form

cancelalarm.addEventListener('click', function() {
    alarmform.style.display = "none";
    alarmtime.value = "";
    editindex = null;
});


// Save alarm

savealarm.addEventListener('click', function() {
    let selectedtime = alarmtime.value;

    if (selectedtime === "") {
        alert("Please add an alarm");
        return;
    }

    if (editindex !== null) {
        alarms[editindex].time = selectedtime;
    } else {
        alarms.push({
            id: Date.now() + Math.random(),
            time: selectedtime,
            active: true
        });
    }

    editindex = null;

    saveToLocalStorage();
    displayalarms();

    alarmform.style.display = "none";
    alarmtime.value = "";
});


// Display alarms

function displayalarms() {
    let html = "";

    for (let i = 0; i < alarms.length; i++) {
        html += `
            <div class="alarm-item">
                <h3>${alarms[i].time}</h3>

                <button class="alarm-toggle ${alarms[i].active ? "on" : "off"}"
                    onclick="toggleAlarm(${i})">
                    ${alarms[i].active ? "ON" : "OFF"}
                </button>

                <button onclick="editAlarm(${i})">Edit</button>

                <button onclick="deletealarm(${i})">Delete</button>
            </div>
        `;
    }

    if (alarms.length === 0) {
        html = `<p>No alarms</p>`;
    }

    alarmlist.innerHTML = html;
}


// Delete alarm

function deletealarm(index) {
    let deletedId = alarms[index].id;

    if (activeAlarmId === deletedId) {
        dismissAlarm();
    }

    if (snoozedAlarmId === deletedId) {
        clearTimeout(snoozeTimeout);
        snoozeTimeout = null;
        snoozedAlarmId = null;
    }

    alarms.splice(index, 1);

    saveToLocalStorage();
    displayalarms();
}


// Toggle alarm ON/OFF

function toggleAlarm(index) {
    alarms[index].active = !alarms[index].active;

    let alarmId = alarms[index].id;

    if (!alarms[index].active) {
        if (activeAlarmId === alarmId) {
            dismissAlarm();
        }

        if (snoozedAlarmId === alarmId) {
            clearTimeout(snoozeTimeout);
            snoozeTimeout = null;
            snoozedAlarmId = null;
        }
    }

    saveToLocalStorage();
    displayalarms();
}


// Edit alarm

function editAlarm(index) {
    editindex = index;

    alarmtime.value = alarms[index].time;
    alarmform.style.display = "block";

    alarmform.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// Initial alarm display

displayalarms();


// Check alarms every second

function checkAlarms() {
    let now = new Date();

    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');

    let currenttime = `${hours}:${minutes}`;

    let currentDate =
        `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

    if (activeAlarmId !== null || isTimerRinging) {
        return;
    }

    for (let i = 0; i < alarms.length; i++) {
        let alarmKey = `${alarms[i].id}-${currentDate}`;

        if (
            alarms[i].time === currenttime &&
            alarms[i].active === true &&
            !lastTriggered.has(alarmKey)
        ) {
            lastTriggered.add(alarmKey);
            triggerAlarm(alarms[i].id);
            break;
        }
    }
}

setInterval(checkAlarms, 1000);


// Trigger alarm

function triggerAlarm(alarmId) {
    let selectedAlarm = alarms.find(function(item) {
        return item.id === alarmId;
    });

    if (!selectedAlarm || !selectedAlarm.active) {
        return;
    }

    activeAlarmId = alarmId;

    ringingtitle.textContent = "⏰ Alarm Ringing!";
    ringingtime.textContent = selectedAlarm.time;

    snoozebtn.style.display = "block";
    ringingpopup.style.display = "block";

    alarmsound.currentTime = 0;

    alarmsound.play().catch(function(error) {
        console.log("Audio playback failed:", error);
    });
}


// ==========================================
// 4. DISMISS ALARM
// ==========================================

function dismissAlarm() {
    alarmsound.pause();
    alarmsound.currentTime = 0;

    ringingpopup.style.display = "none";

    clearTimeout(snoozeTimeout);

    snoozeTimeout = null;
    snoozedAlarmId = null;
    activeAlarmId = null;

    isTimerRinging = false;

    ringingtitle.textContent = "⏰ Alarm Ringing!";
    snoozebtn.style.display = "block";
}

dismissbtn.addEventListener('click', dismissAlarm);


// ==========================================
// 5. SNOOZE ALARM
// ==========================================

function snoozeAlarm() {
    if (activeAlarmId === null) {
        return;
    }

    let alarmId = activeAlarmId;

    alarmsound.pause();
    alarmsound.currentTime = 0;

    ringingpopup.style.display = "none";

    activeAlarmId = null;
    snoozedAlarmId = alarmId;

    clearTimeout(snoozeTimeout);

    snoozeTimeout = setTimeout(function() {
        let selectedAlarm = alarms.find(function(item) {
            return item.id === alarmId;
        });

        snoozedAlarmId = null;
        snoozeTimeout = null;

        if (selectedAlarm && selectedAlarm.active) {
            triggerAlarm(alarmId);
        }
    }, 5 * 60 * 1000);
}

snoozebtn.addEventListener('click', snoozeAlarm);


// ==========================================
// 6. WORLD CLOCK
// ==========================================

let addcitybtn = document.getElementById('addcitybtn');
let cityform = document.getElementById('cityform');
let cancelcitybtn = document.getElementById('cancelcitybtn');
let cityselect = document.getElementById('cityselect');

let savecitybtn = document.getElementById('savecitybtn');
let citylist = document.getElementById('citylist');


// City names

let cityNames = {
    "Asia/Kolkata": "New Delhi",
    "Europe/London": "London",
    "America/New_York": "New York",
    "Asia/Tokyo": "Tokyo",
    "Asia/Dubai": "Dubai",
    "Australia/Sydney": "Sydney"
};


// Load cities

let cities = [];

try {
    cities = JSON.parse(localStorage.getItem("worldCities")) || [];
} catch (error) {
    console.error("Unable to load cities:", error);
    cities = [];
}


// Open city form

addcitybtn.addEventListener('click', function() {
    cityform.style.display = "block";
});


// Cancel city form

cancelcitybtn.addEventListener('click', function() {
    cityform.style.display = "none";
    cityselect.value = "";
});


// Save city

savecitybtn.addEventListener('click', function() {
    let selectedcity = cityselect.value;

    if (selectedcity === "") {
        alert("Please select a city");
        return;
    }

    if (cities.includes(selectedcity)) {
        alert("City already added!");
        return;
    }

    cities.push(selectedcity);

    saveCities();
    displaycities();

    cityform.style.display = "none";
    cityselect.value = "";
});


// Display cities

function displaycities() {
    if (cities.length === 0) {
        citylist.innerHTML = "<p>No city added yet</p>";
        return;
    }

    let html = "";

    for (let i = 0; i < cities.length; i++) {
        let timezone = cities[i];

        let time = new Intl.DateTimeFormat('en-IN', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).format(new Date());

        let date = new Intl.DateTimeFormat('en-IN', {
            timeZone: timezone,
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());

        html += `
            <div class="city-card">
                <h3>${cityNames[timezone] || timezone}</h3>

                <div class="city-time">${time}</div>

                <p class="city-date">${date}</p>

                <button onclick="removeCity(${i})">Remove</button>
            </div>
        `;
    }

    citylist.innerHTML = html;
}


// Remove city

function removeCity(index) {
    cities.splice(index, 1);

    saveCities();
    displaycities();
}


// Save cities

function saveCities() {
    localStorage.setItem("worldCities", JSON.stringify(cities));
}


// Initial display and live update

displaycities();
setInterval(displaycities, 1000);


// ==========================================
// 7. STOPWATCH
// ==========================================

let stopwatchtime = document.getElementById('stopwatchtime');
let startbtn = document.getElementById('startbtn');
let lapbtn = document.getElementById('lapbtn');
let resetbtn = document.getElementById('resetbtn');

let laplist = document.getElementById('laplist');

let startTime = 0;
let elapsedTime = 0;

let stopwatchInterval = null;
let isRunning = false;
let lapcount = 0;


// Update stopwatch

function updatestopwatch() {
    let currentTime = Date.now();

    elapsedTime = currentTime - startTime;

    let minutes = Math.floor(elapsedTime / 60000);
    let seconds = Math.floor((elapsedTime % 60000) / 1000);
    let milliseconds = Math.floor((elapsedTime % 1000) / 10);

    stopwatchtime.textContent =
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}.` +
        `${String(milliseconds).padStart(2, '0')}`;
}


// Start / Pause stopwatch

startbtn.addEventListener('click', function() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;

        stopwatchInterval = setInterval(updatestopwatch, 10);

        isRunning = true;
        startbtn.textContent = "Pause";

    } else {
        clearInterval(stopwatchInterval);

        isRunning = false;
        startbtn.textContent = "Resume";
    }
});


// Reset stopwatch

resetbtn.addEventListener('click', function() {
    clearInterval(stopwatchInterval);

    startTime = 0;
    elapsedTime = 0;

    isRunning = false;
    lapcount = 0;

    laplist.innerHTML = "<p>No laps recorded</p>";
    stopwatchtime.textContent = "00:00.00";

    startbtn.textContent = "Start";
});


// Lap functionality

lapbtn.addEventListener('click', function() {
    if (!isRunning) {
        return;
    }

    lapcount++;

    let lapTime = stopwatchtime.textContent;

    let html = `
        <div class="lap-item">
            <span>Lap ${lapcount}</span>
            <span>${lapTime}</span>
        </div>
    `;

    if (lapcount === 1) {
        laplist.innerHTML = "";
    }

    laplist.insertAdjacentHTML('afterbegin', html);
});


// ==========================================
// 8. TIMER
// ==========================================

let timerhours = document.getElementById('timerhours');
let timerminutes = document.getElementById('timerminutes');
let timerseconds = document.getElementById('timerseconds');

let timerdisplay = document.getElementById('timerdisplay');

let timerstartbtn = document.getElementById('timerstartbtn');
let timerresetbtn = document.getElementById('timerresetbtn');

let timerInterval = null;
let remainingTime = 0;
let timerRunning = false;


// Update timer display

function updateTimerDisplay() {
    let hours = Math.floor(remainingTime / 3600);
    let minutes = Math.floor((remainingTime % 3600) / 60);
    let seconds = remainingTime % 60;

    timerdisplay.textContent =
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`;
}


// Start / Pause / Resume timer

timerstartbtn.addEventListener('click', function() {

    // Don't start if an alarm or timer is ringing
    if (isTimerRinging || activeAlarmId !== null) {
        return;
    }

    // Pause timer
    if (timerRunning) {
        clearInterval(timerInterval);

        timerRunning = false;
        timerstartbtn.textContent = "Resume";

        return;
    }

    // Read input values when starting a new timer
    if (remainingTime === 0) {
        let hours = Number(timerhours.value);
        let minutes = Number(timerminutes.value);
        let seconds = Number(timerseconds.value);

        // Validate input
        if (
            !Number.isInteger(hours) ||
            !Number.isInteger(minutes) ||
            !Number.isInteger(seconds) ||
            hours < 0 ||
            minutes < 0 || minutes > 59 ||
            seconds < 0 || seconds > 59
        ) {
            alert("Please enter valid time!");
            return;
        }

        remainingTime = hours * 3600 + minutes * 60 + seconds;
    }

    // Don't start a zero timer
    if (remainingTime <= 0) {
        alert("Please set a valid time!");
        return;
    }

    timerRunning = true;
    timerstartbtn.textContent = "Pause";

    timerInterval = setInterval(function() {
        remainingTime--;

        updateTimerDisplay();

        // Timer completed
        if (remainingTime <= 0) {
            clearInterval(timerInterval);

            remainingTime = 0;
            updateTimerDisplay();

            timerRunning = false;
            timerstartbtn.textContent = "Start";

            isTimerRinging = true;

            ringingtitle.textContent = "⏰ Timer Completed!";
            ringingtime.textContent = "Time's Up!";

            snoozebtn.style.display = "none";
            ringingpopup.style.display = "block";

            alarmsound.currentTime = 0;

            alarmsound.play().catch(function(error) {
                console.log("Audio playback failed:", error);
            });
        }

    }, 1000);
});


// ==========================================
// 9. RESET TIMER
// ==========================================

timerresetbtn.addEventListener('click', function() {
    clearInterval(timerInterval);

    if (isTimerRinging) {
        dismissAlarm();
    }

    timerRunning = false;
    remainingTime = 0;

    timerhours.value = 0;
    timerminutes.value = 5;
    timerseconds.value = 0;

    timerdisplay.textContent = "00:05:00";

    timerstartbtn.textContent = "Start";
});


// Initial timer display

timerdisplay.textContent = "00:05:00";


// ==========================================
// END OF TIMEIFY 2.0
// ==========================================