// server.js - Create this file in your project root
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve your HTML files

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, project, nda } = req.body;

    // Basic validation
    if (!name || !email || !project) {
      return res.status(400).json({ 
        error: 'Name, Email und Projektdetails sind erforderlich.' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' 
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const emailContent = `
      <h2>Neue Projektanfrage von der Website</h2>
      
      <h3>Kontaktinformationen:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone || 'Nicht angegeben'}</p>
      
      <h3>Projektdetails:</h3>
      <p>${project.replace(/\n/g, '<br>')}</p>
      
      <h3>Zusätzliche Informationen:</h3>
      <p><strong>NDA gewünscht:</strong> ${nda ? 'Ja' : 'Nein'}</p>
      
      <hr>
      <p><small>Gesendet über die Devory Website am ${new Date().toLocaleString('de-DE')}</small></p>
    `;

    // Send email to yourself
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'hello@devory.de',
      subject: `Neue Projektanfrage von ${name}`,
      html: emailContent,
    });

    // Send confirmation email to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Ihre Projektanfrage bei Devory - Bestätigung',
      html: `
        <h2>Vielen Dank für Ihre Projektanfrage!</h2>
        
        <p>Hallo ${name},</p>
        
        <p>wir haben Ihre Projektanfrage erfolgreich erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.</p>
        
        <h3>Ihre Anfrage im Überblick:</h3>
        <p><strong>Projektdetails:</strong><br>${project.replace(/\n/g, '<br>')}</p>
        
        ${nda ? '<p>Sie haben eine Geheimhaltungsvereinbarung (NDA) angefordert. Diese senden wir Ihnen mit unserer ersten Antwort zu.</p>' : ''}
        
        <p>Falls Sie dringende Fragen haben, erreichen Sie uns direkt unter:</p>
        <p>📞 +49 6195 6737310<br>
        📧 hello@devory.de</p>
        
        <p>Mit freundlichen Grüßen<br>
        Ihr Devory Team</p>
        
        <hr>
        <p><small>Devory GmbH | Frankfurter Str. 84 | 65779 Kelkheim (Taunus)</small></p>
      `,
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Ihre Nachricht wurde erfolgreich gesendet!' 
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ 
      error: 'Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.' 
    });
  }
});

// Serve your HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📧 Make sure you have EMAIL_USER and EMAIL_PASS in your .env.local file');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Server shutting down...');
  process.exit(0);
});