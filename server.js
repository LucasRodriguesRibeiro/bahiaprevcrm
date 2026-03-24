import express from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs';
import QRCode from 'qrcode';
import pino from 'pino';

const app = express();
app.use(cors());
app.use(express.json());

let sock = null;
let qrCodeValue = null;
let connectionStatus = 'DISCONNECTED';

async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'debug' })
    });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeValue = qr;
      connectionStatus = 'WAITING_QR';
      console.log('Novo QR Code gerado.');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão fechada. Reconectando...', shouldReconnect);
      connectionStatus = 'DISCONNECTED';
      qrCodeValue = null;
      if (shouldReconnect) {
        // Removido para evitar loop infinito em erros de frame do Node 25
      }
    } else if (connection === 'open') {
      console.log('WhatsApp Conectado com sucesso!');
      connectionStatus = 'CONNECTED';
      qrCodeValue = null;
    }
  });

    sock.ev.on('creds.update', saveCreds);
  } catch (err) {
    console.error("Erro ao conectar WhatsApp:", err);
  }
}

// Inicia conexão em background
connectToWhatsApp();

app.get('/api/status', (req, res) => {
  res.json({ status: connectionStatus });
});

app.get('/api/qr', async (req, res) => {
  if (connectionStatus === 'CONNECTED') {
    return res.json({ status: 'CONNECTED' });
  }
  if (!qrCodeValue) {
    return res.json({ status: 'LOADING', message: 'Gerando QR... Aguarde.' });
  }
  try {
    const url = await QRCode.toDataURL(qrCodeValue);
    res.json({ status: 'WAITING_QR', qr: url });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar imagem do QR Code' });
  }
});

app.post('/api/send-message', async (req, res) => {
  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp não está conectado!' });
  }
  
  const { phone, text } = req.body;
  
  if (!phone || !text) {
    return res.status(400).json({ error: 'Telefone e texto são obrigatórios.' });
  }

  // Formatar número para padrão Baileys (Ex: 5511987654321@s.whatsapp.net)
  let cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone.startsWith('55')) {
    cleanPhone = '55' + cleanPhone;
  }
  const formattedPhone = `${cleanPhone}@s.whatsapp.net`;

  try {
    await sock.sendMessage(formattedPhone, { text });
    console.log(`Mensagem enviada para ${cleanPhone}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar: ' + err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`[WhatsApp Backend] Servidor rodando na porta ${PORT}`);
});
