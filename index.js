const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// API Routes
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Name validation (letters and spaces only)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Name should contain only letters and spaces.'
      });
    }

    // Message length validation
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long.'
      });
    }

    const targetEmail = process.env.TARGET_EMAIL;
    
    if (!targetEmail) {
      throw new Error('Target email not configured');
    }

    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `New Inquiry from ${name} - Agni Shorts`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin-bottom: 5px;">🔥 Agni Shorts</h1>
            <p style="color: #666; margin: 0;">New Inquiry Received</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>This inquiry was sent through the Agni Shorts contact form.</p>
          </div>
        </div>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Success response
    res.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });

    console.log(`Email sent successfully from ${name} (${email})`);

  } catch (error) {
    console.error('Error sending email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again later or contact us via WhatsApp.'
    });
  }
});

// API Routes
app.post('/api/agni', async (req, res) => {
  console.log('Received request for /api/agni');
  // TODO: Add specific email sending logic for Agni
  // For now, just sending a success response
  res.json({
    success: true,
    message: 'Agni endpoint called successfully!'
  });
});

app.post('/api/kavach', async (req, res) => {
  console.log('Received request for /api/kavach');
  // TODO: Add specific email sending logic for Kavach
  // For now, just sending a success response
  res.json({
    success: true,
    message: 'Kavach endpoint called successfully!'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React app for all other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Agni Shorts Inquiry Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.TARGET_EMAIL) {
    console.warn('⚠️  Warning: SMTP credentials or target email not configured properly');
  }
});

module.exports = app;