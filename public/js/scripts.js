
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