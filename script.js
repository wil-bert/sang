// Event data (simulating database)
let events = [];

// Select DOM elements
const eventList = document.getElementById("eventList");
const eventForm = document.getElementById("eventForm");
const eventNameInput = document.getElementById("eventName");
const eventDateInput = document.getElementById("eventDate");
const eventLocationInput = document.getElementById("eventLocation");

const userViewLink = document.getElementById("userView");
const adminViewLink = document.getElementById("adminView");
const eventsSection = document.getElementById("eventsSection");
const adminSection = document.getElementById("adminSection");

// Event: Submit event (Admin adds a new event)
eventForm.addEventListener("submit", function (e) {
    e.preventDefault();
    
    // Get form data
    const eventName = eventNameInput.value;
    const eventDate = eventDateInput.value;
    const eventLocation = eventLocationInput.value;

    // Create a new event object
    const newEvent = {
        name: eventName,
        date: eventDate,
        location: eventLocation
    };

    // Add event to array
    events.push(newEvent);

    // Clear form
    eventForm.reset();

    // Display updated event list
    displayEvents();
});

// Function to display events
function displayEvents() {
    eventList.innerHTML = "";

    if (events.length === 0) {
        eventList.innerHTML = "<p>No upcoming events.</p>";
    } else {
        events.forEach((event, index) => {
            const eventItem = document.createElement("div");
            eventItem.classList.add("event-item");
            eventItem.innerHTML = `
                <h3>${event.name}</h3>
                <p>Date: ${event.date}</p>
                <p>Location: ${event.location}</p>
                <button onclick="bookTicket(${index})">Book Ticket</button>
            `;
            eventList.appendChild(eventItem);
        });
    }
}

// Event: Book ticket (User books a ticket for an event)
function bookTicket(index) {
    alert(`You have booked a ticket for ${events[index].name}!`);
}

// Toggle between User View and Admin View
userViewLink.addEventListener("click", function () {
    eventsSection.style.display = "block";
    adminSection.style.display = "none";
});

adminViewLink.addEventListener("click", function () {
    adminSection.style.display = "block";
    eventsSection.style.display = "none";
});

// Initial display of events (if any)
displayEvents();
// User Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Store token for future requests
        localStorage.setItem('token', data.token);
        alert('Login successful');
        // Load events
        loadEvents();
    } else {
        alert(data.message);
    }
});

// User Signup
signupButton.addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'user' }) // User role
    });

    const data = await response.json();
    alert(data.message);
});
async function loadEvents() {
    const response = await fetch('http://localhost:3000/events', {
        headers: { 'Authorization': localStorage.getItem('token') }
    });
    const events = await response.json();

    // Render events as cards
    eventList.innerHTML = "";
    events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.classList.add("event-card");
        eventCard.innerHTML = `
            <h3>${event.name}</h3>
            <p>Date: ${event.date}</p>
            <p>Location: ${event.location}</p>
            <button onclick="bookEvent('${event._id}')">Book Ticket</button>
        `;
        eventList.appendChild(eventCard);
    });
}


// Book event
async function bookEvent(eventId) {
    const response = await fetch('http://localhost:3000/events/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ eventId })
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
    } else {
        alert(data.message);
    }
}

function showSection(section) {
    // Hide all sections
    document.getElementById("homeSection").style.display = 'none';
    document.getElementById("eventsSection").style.display = 'none';
    document.getElementById("authSection").style.display = 'none';
    document.getElementById("dashboardSection").style.display = 'none';

    // Show the selected section
    document.getElementById(`${section}Section`).style.display = 'block';
}

function logout() {
    localStorage.removeItem('token');
    alert('Logged out successfully');
    // Hide dashboard and logout button after logout
    document.getElementById('dashboardLink').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
    showSection('home');
}

function loadDashboard() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const user = JSON.parse(atob(token.split('.')[1]));
    
    if (user.role === 'admin') {
        document.getElementById('adminDashboard').style.display = 'block';
    } else {
        document.getElementById('userDashboard').style.display = 'block';
        loadUserBookings();
    }
}

async function loadUserBookings() {
    const response = await fetch('http://localhost:3000/user/bookings', {
        headers: { 'Authorization': localStorage.getItem('token') }
    });
    const bookings = await response.json();

    const bookedEventsList = document.getElementById("bookedEventsList");
    bookedEventsList.innerHTML = "";
    bookings.forEach(event => {
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        eventItem.innerHTML = `<p>${event.name} - ${event.date} @ ${event.location}</p>`;
        bookedEventsList.appendChild(eventItem);
    });
}

function showNotification(message, isError = false) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.toggle("error", isError);
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

if (response.ok) {
    showNotification('Ticket booked successfully');
} else {
    showNotification(data.message, true);
}
if (!response.ok) {
    showNotification(data.message, true);
} else {
    showNotification('Login successful');
}
