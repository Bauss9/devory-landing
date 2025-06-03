export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
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
  
      // Import nodemailer
      const nodemailer = require('nodemailer');
  
      // Create transporter (using Gmail SMTP - you can change this)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS, // Your Gmail app password
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
        to: 'hello@devory.de', // Your business email
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
          <p>📞 +49 (0) 69 17009801<br>
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
  }