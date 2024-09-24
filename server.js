const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventBooking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, default: 'user' } // 'admin' or 'user'
});
const User = mongoose.model('User', userSchema);

// Event schema and model
const eventSchema = new mongoose.Schema({
    name: String,
    date: String,
    location: String,
    bookedUsers: [String] // Array of usernames
});
const Event = mongoose.model('Event', eventSchema);

// Middleware for protected routes
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403); // Forbidden
    
    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user; // Attach user to request
        next();
    });
};

// User Signup
app.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    // Generate token
    const token = jwt.sign({ username: newUser.username, role: newUser.role }, 'secretkey');
    
    res.json({ message: 'User created successfully', token });
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ username: user.username, role: user.role }, 'secretkey');
    res.json({ token });
});

// Post an Event (Admin only)
app.post('/events', authenticateToken, async (req, res) => {
    // Check if the user is an admin
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { name, date, location } = req.body;
    const newEvent = new Event({ name, date, location });
    await newEvent.save();

    res.json({ message: 'Event posted successfully' });
});

// Get Events (User & Admin)
app.get('/events', authenticateToken, async (req, res) => {
    const events = await Event.find();
    res.json(events);
});

// Book an Event (User only)
app.post('/events/book', authenticateToken, async (req, res) => {
    const { eventId } = req.body;

    // Check if user is not an admin
    if (req.user.role !== 'user') return res.status(403).json({ message: 'Admins cannot book events' });

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the user has already booked the event
    if (event.bookedUsers.includes(req.user.username)) {
        return res.status(400).json({ message: 'You have already booked this event' });
    }

    // Add user to the event's bookedUsers
    event.bookedUsers.push(req.user.username);
    await event.save();

    res.json({ message: 'Ticket booked successfully' });
});

// Get Booked Events for a User
app.get('/user/bookings', authenticateToken, async (req, res) => {
    const events = await Event.find({ bookedUsers: req.user.username });
    res.json(events);
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
