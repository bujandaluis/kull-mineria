require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  const { nombre, empresa, cargo, email, telefono, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos.' });
  }

  const mailOptions = {
    from: `"${nombre}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `Nuevo contacto desde kull.cl — ${nombre} (${empresa || 'sin empresa'})`,
    html: `
      <h2 style="color:#D31B2A;">Nuevo mensaje de contacto</h2>
      <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Nombre</td><td style="padding:8px;">${nombre}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Empresa</td><td style="padding:8px;">${empresa || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Cargo</td><td style="padding:8px;">${cargo || '—'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Teléfono</td><td style="padding:8px;">${telefono || '—'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Mensaje</td><td style="padding:8px;">${mensaje.replace(/\n/g, '<br/>')}</td></tr>
      </table>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (err) {
    console.error('Error al enviar correo:', err.message);
    res.status(500).json({
      error: 'No se pudo enviar el mensaje. Intenta nuevamente.',
      detail: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
