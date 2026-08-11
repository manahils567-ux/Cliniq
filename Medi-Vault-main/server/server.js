const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const net = require('net');
require('dotenv').config();

// Import reminder controller for initializing reminders
const reminderController = require('./controllers/reminderController');

// Function to check if a port is in use
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
};

// Function to find an available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  }),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Create Express app
const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from React client
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug middleware for routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/contact', contactRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MediVault API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const startServer = async () => {
  try {
    const preferredPort = process.env.PORT || 5000;
    const port = await findAvailablePort(preferredPort);
    
    // First connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medi-vault', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Then start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      if (port !== preferredPort) {
        console.log(`Note: Original port ${preferredPort} was in use, using ${port} instead`);
      }
    });

    // Initialize reminders after MongoDB connection is established
    await reminderController.initializeReminders();
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

