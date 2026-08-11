const nodemailer = require('nodemailer');

// Configure nodemailer transporter
let transporter;
try {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email configuration missing. Contact form will not send emails.');
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
} catch (error) {
  console.error('Error configuring email transport:', error);
}

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!transporter) {
      console.warn('Email transport not configured. Contact form submission saved but email not sent.');
      return res.status(200).json({ 
        message: 'Contact form submitted successfully',
        warning: 'Email notification could not be sent'
      });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Use configured email as sender
      replyTo: email, // Set reply-to as the contact form submitter
      to: process.env.EMAIL_USER, // Send to configured email
      subject: `Contact Form: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
};

// Handle authenticated user contact form
exports.submitUserContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!transporter) {
      console.warn('Email transport not configured. Contact form submission saved but email not sent.');
      return res.status(200).json({ 
        message: 'Contact form submitted successfully',
        warning: 'Email notification could not be sent'
      });
    }

    // Email content with user ID for reference
    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `MediVault Support Request - User: ${name}`,
      text: `
User ID: ${userId}
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
        <h3>MediVault Support Request</h3>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Your message has been submitted successfully' });
  } catch (error) {
    console.error('User contact form error:', error);
    res.status(500).json({ message: 'Error submitting message', error: error.message });
  }
}; 