const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const qrcode = require('qrcode');
const twilio = require('twilio');
const MedicalRecord = require('../models/MedicalRecord'); // Assuming MedicalRecord model exists

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      phoneNumber
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your MediVault OTP is: ${otp}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    // In a real application, you would store the OTP in a secure way
    // For now, we'll just return success
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // In a real application, you would verify the OTP against the stored value
    // For now, we'll just return success
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

// Generate QR Code for doctor access
exports.generateAccessQR = async (req, res) => {
  try {
    console.log('Generate QR code request received');
    
    // Get patient ID from request body or from authenticated user
    const patientId = req.body.patientId || (req.user && req.user._id ? req.user._id : null);
    
    console.log('Patient ID determined:', patientId);
    
    if (!patientId) {
      console.error('Patient ID missing from request');
      return res.status(400).json({ 
        message: 'Patient ID is required',
        success: false
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    
    if (!patient) {
      console.error(`Patient not found with ID: ${patientId}`);
      return res.status(404).json({ 
        message: 'Patient not found',
        success: false
      });
    }

    console.log('Patient found:', patient.name);

    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-fallback-secret';
    
    // Generate a unique access token that expires in 24 hours
    const accessToken = jwt.sign(
      { 
        patientId: patient._id.toString(), // Ensure ID is a string
        type: 'doctor_access',
        timestamp: Date.now()
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('Access token generated');
    
    // Create the redirect URL with the token
    const redirectUrl = `http://localhost:5000/api/users/access/${accessToken}`;
    
    // Generate QR code as data URL with higher error correction
    try {
      const qrCodeDataUrl = await qrcode.toDataURL(redirectUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 8,
        type: 'image/png',
      });
      
      console.log('QR code generated successfully');

      return res.status(200).json({ 
        qrCode: qrCodeDataUrl,
        message: 'QR code generated successfully',
        success: true
      });
    } catch (qrError) {
      console.error('QR generation specific error:', qrError);
      return res.status(500).json({ 
        message: 'Error generating QR code', 
        error: qrError.message,
        details: 'QR code generation library failed',
        success: false
      });
    }
  } catch (error) {
    console.error('QR Code generation error:', error);
    return res.status(500).json({ 
      message: 'Error generating QR code', 
      error: error.message,
      success: false,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

// Verify QR code and grant access
exports.verifyQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({ message: 'QR code data is required' });
    }

    // Verify the token
    const decoded = jwt.verify(qrCode, process.env.JWT_SECRET);
    
    if (!decoded || decoded.type !== 'doctor_access') {
      return res.status(400).json({ message: 'Invalid QR code' });
    }

    // Check if token is expired
    if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Get patient data
    const patient = await User.findById(decoded.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ 
      message: 'Access granted',
      patientData: {
        name: patient.name,
        email: patient.email,
        medicalRecords: patient.medicalRecords
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid QR code' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'QR code has expired' });
    }
    res.status(500).json({ message: 'Error verifying QR code', error: error.message });
  }
};

// Handle QR code redirection
exports.handleQRRedirect = (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).send('Invalid or missing access token');
    }
    
    // Redirect to the patient records page with the token as a URL parameter
    res.redirect(`http://localhost:3000/patient-records/${token}`);
  } catch (error) {
    console.error('QR Redirect Error:', error);
    res.status(500).send('Error processing QR code redirection');
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'phoneNumber'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const user = await User.findById(req.user._id);
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Add medical record 
exports.addMedicalRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get file mime type and map it to fileType enum
    const mimeToType = {
      'application/pdf': 'prescription',
      'application/msword': 'prescription',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'prescription',
      'image/jpeg': 'scan',
      'image/png': 'scan',
      'image/jpg': 'scan'
    };

    // Get the Cloudinary URL from the uploaded file
    const fileUrl = req.file.path;  // Cloudinary returns the URL in req.file.path

    const newRecord = new MedicalRecord({
      patientId: req.user._id,
      title: req.body.title || req.file.originalname,
      description: req.body.description || 'Uploaded medical record',
      fileUrl: fileUrl,
      fileType: mimeToType[req.file.mimetype] || 'other',
      date: req.body.date || new Date(),
      doctorId: req.body.doctorId,
      hospital: req.body.hospital
    });

    await newRecord.save();

    res.status(201).json({
      message: 'Medical record uploaded successfully',
      record: {
        id: newRecord._id,
        title: newRecord.title,
        fileUrl: newRecord.fileUrl,
        fileType: newRecord.fileType,
        date: newRecord.date
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading medical record', error: error.message });
  }
};

// Get medical records
exports.getMedicalRecords = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('medicalRecords');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.medicalRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
};