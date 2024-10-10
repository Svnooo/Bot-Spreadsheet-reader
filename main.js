require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { google } = require('googleapis');

// Ambil variabel dari file .env
const BOT_TOKEN = process.env.BOT_TOKEN;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME;

// Inisialisasi bot Telegram
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Inisialisasi Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Fungsi untuk membaca data dari Google Sheets
async function readSheetData() {
  const sheets = google.sheets({ version: 'v4', auth });
  const range = `${SHEET_NAME}!A1:E`; // Sesuaikan rentang sesuai kebutuhan Anda
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
  });
  return response.data.values;
}

// Fungsi untuk mencari data berdasarkan ID
async function getDataById(id) {
  const data = await readSheetData();
  // Mengasumsikan ID berada di kolom pertama
  const rowData = data.find(row => row[0] === id); // ID berada di kolom pertama
  return rowData ? rowData : null;
}

// Menangani pesan dari pengguna
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Menangani perintah /start
  if (userMessage === '/start') {
    const welcomeMessage = `Selamat datang! Saya adalah bot yang dapat membantu Anda membaca data dari Google Sheets.\n\nKetikkan /help untuk melihat perintah yang tersedia.`;
    bot.sendMessage(chatId, welcomeMessage);
    return; // Hentikan eksekusi lebih lanjut
  }

  // Menangani perintah /help
  if (userMessage === '/help') {
    const helpMessage = `Berikut adalah perintah yang tersedia:\n` +
                        `/start - Menyambut pengguna dan memberi tahu cara menggunakan bot ini.\n` +
                        `/help - Menampilkan daftar perintah yang tersedia.\n` +
                        `Kirimkan ID untuk mendapatkan data dari spreadsheet.`;
    bot.sendMessage(chatId, helpMessage);
    return; // Hentikan eksekusi lebih lanjut
  }

  // Mencoba mengambil data berdasarkan ID yang diberikan oleh pengguna
  const rowData = await getDataById(userMessage);

  if (rowData) {
    // Format output
    let reply = `Data dengan ID: ${userMessage} sebagai berikut:\n`;
    reply += `Site ID     : ${rowData[1]}\n`;
    reply += `WITEL       : ${rowData[2]}\n`;
    reply += `Site Name   : ${rowData[3]}\n`;
    reply += `STO         : ${rowData[4]}\n`;

    bot.sendMessage(chatId, reply);
  } else {
    bot.sendMessage(chatId, `Data dengan ID ${userMessage} tidak ditemukan.`);
  }
});

console.log('Bot is running...');
