
//dashboard.js
const manageButtons = document.querySelectorAll('.manage-timeslots-btn');
manageButtons.forEach(button => {
    button.addEventListener('click', function() {
        const classId = this.getAttribute('data-classid');
        const className = this.getAttribute('data-classname');
        document.getElementById('tmClassId').value = classId;
        document.getElementById('tmClassName').textContent = className;

        // For demo purposes, load dummy timeslots if available.
        const dummyTimeslots = [];
        const listContainer = document.getElementById('tmTimeslotList');
        listContainer.innerHTML = "";
        document.getElementById('tmTimeslotsCSV').value = dummyTimeslots.join(',');
        dummyTimeslots.forEach((ts, index) => {
            const badge = createTimeslotBadge(ts, index);
            listContainer.appendChild(badge);
        });
        document.getElementById('tmDate').value = "";
        document.getElementById('tmStartTime').value = "";
        document.getElementById('tmEndTime').value = "";
    });
});

function formatTimeslot(dateStr, startTime, endTime) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0] + ' - ' + startTime + ' - ' + endTime;
}

function createTimeslotBadge(timeslotCSV, index) {
    const parts = timeslotCSV.split(' ');
    if (parts.length !== 2) return document.createTextNode(timeslotCSV);
    const formatted = formatTimeslot(parts[0], parts[1].split('-')[0], parts[1].split('-')[1]);
    const badge = document.createElement('span');
    badge.className = 'badge bg-success fs-6 p-2';
    badge.style.cursor = 'pointer';
    badge.textContent = formatted + " ×";
    badge.addEventListener('click', function() {
        badge.remove();
        updateTimeslotsCSV();
    });
    return badge;
}

document.getElementById('tmAddBtn').addEventListener('click', function() {
    const dateInput = document.getElementById('tmDate');
    const startInput = document.getElementById('tmStartTime');
    const endInput = document.getElementById('tmEndTime');
    const dateVal = dateInput.value;
    const startVal = startInput.value;
    const endVal = endInput.value;
    if (!dateVal || !startVal || !endVal) {
        alert("Please fill in date, start time, and end time.");
        return;
    }
    const timeslot = dateVal + ' ' + startVal + '-' + endVal;
    const formatted = formatTimeslot(dateVal, startVal, endVal);
    const listContainer = document.getElementById('tmTimeslotList');
    const badge = createTimeslotBadge(timeslot, listContainer.childElementCount);
    listContainer.appendChild(badge);
    updateTimeslotsCSV();
    dateInput.value = "";
    startInput.value = "";
    endInput.value = "";
});

function updateTimeslotsCSV() {
    const listContainer = document.getElementById('tmTimeslotList');
    const badges = listContainer.querySelectorAll('.badge');
    const timeslots = [];
    badges.forEach(badge => {
        const text = badge.textContent.replace(' ×', '').trim();
        timeslots.push(text);
    });
    document.getElementById('tmTimeslotsCSV').value = timeslots.join(',');
}


//bookclass.mustache
const timeButtons = document.querySelectorAll('.class-time-btn');
timeButtons.forEach(button => {
    button.addEventListener('click', function() {
        timeButtons.forEach(btn => {
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-secondary');
        });
        this.classList.remove('btn-outline-secondary');
        this.classList.add('btn-success');
        document.getElementById('selectedClassTimeInput').value = this.getAttribute('data-time');
    });
});

//bookcourse.mustache
document.addEventListener("DOMContentLoaded", function() {
    const courseData = document.getElementById('courseData');
    const duration = parseInt(courseData.getAttribute('data-duration'), 10);
    const scheduleStr = courseData.getAttribute('data-schedule');
    const schedule = scheduleStr.split(',').filter(day => day.trim() !== "");

    function getAvailableDates(duration, schedule) {
        const availableDates = [];
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + duration * 7);
        const weekdayMap = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
        };
        const scheduledDays = schedule.map(day => weekdayMap[day]);
        for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (scheduledDays.includes(d.getDay())) {
                const yyyy = d.getFullYear();
                let mm = d.getMonth() + 1;
                let dd = d.getDate();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                availableDates.push(`${yyyy}-${mm}-${dd}`);
            }
        }
        return availableDates;
    }

    const availableDates = getAvailableDates(duration, schedule);
    const datesList = document.getElementById('courseDatesList');
    datesList.innerHTML = "";
    availableDates.forEach(dateStr => {
        const parts = dateStr.split('-');
        const formatted = parts[2] + '-' + parts[1] + '-' + parts[0];
        const span = document.createElement('span');
        span.className = 'badge bg-light border text-dark date-badge';
        span.textContent = formatted;
        datesList.appendChild(span);
    });
    document.getElementById('selectedDatesInput').value = availableDates.join(',');
});