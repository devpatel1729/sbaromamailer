// const express = require('express');
// const bodyParser = require('body-parser');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const nodemailer = require('nodemailer');
// const cors = require('cors'); // Import CORS

// // Initialize express
// const app = express();
// const upload = multer({ dest: 'uploads/' });  // Temporary storage for files

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Email sending service (merged with app.js)
// async function sendBulkEmails(recipients, htmlContent) {
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',  // Replace with your SMTP host
//         port: 465,  // Replace with the appropriate port (e.g., 465 for SSL)
//         secure: true,  // true for 465 (SSL) or false for 587 (TLS)
//         auth: {
//             user: '26601265d@gmail.com',
//             pass: 'gvxa mpid ilua cbkw',
//         }
//     });

//     const emailPromises = recipients.map((recipient) => {
//         return transporter.sendMail({
//             // from: '"Sender Name" <info@sbaroma.com>',  // Replace with your email and name
//             to: recipient,  // Recipient email
//             subject: subject,  // You can also pass this as payload
//             html: htmlContent,  // HTML content from payload
//         });
//     });

//     await Promise.all(emailPromises);
// }

// // Route for sending bulk emails
// // app.post('/send-email', async (req, res) => {
// //     const { recipients, htmlContent , subject } = req.body;

// //     if (!recipients || !htmlContent || !subject) {
// //         return res.status(400).send({ error: 'Recipients and HTML content are required!' });
// //     }

// //     try {
// //         await sendBulkEmails(recipients, htmlContent , subject);
// //         res.status(200).send({ message: 'Emails sent successfully!' });
// //     } catch (error) {
// //         console.error('Error sending emails:', error);
// //         res.status(500).send({ error: 'Error sending emails' });
// //     }
// // });

// app.post('/send-email', upload.single('file'), async (req, res) => {
//     try {
//         // Parse Excel file
//         const workbook = xlsx.readFile(req.file.path);
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const data = xlsx.utils.sheet_to_json(worksheet);

//         // Extract email addresses
//         const recipients = data.map(row => row.email).filter(email => email);
//         console.log(recipients);
//         // Send emails
//         const htmlContent = `<h1>Custom Email Content</h1>`;
//         await sendBulkEmails(recipients, htmlContent);

//         res.status(200).send({ message: 'Emails sent successfully!' });
//     } catch (error) {
//         console.error('Error processing file:', error);
//         res.status(500).send({ error: 'Error sending emails' });
//     }
// });

// module.exports = app;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Modify multer to upload to the correct directory
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

app.use(cors());
app.use(bodyParser.json());

async function sendBulkEmails(recipients, subject, htmlContent) {
    console.log('Sending emails to recipients:', recipients);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: '26601265d@gmail.com',
            pass: 'gvxa mpid ilua cbkw',
        },
    });

    const emailPromises = recipients.map((recipient) => {
        return transporter.sendMail({
            to: recipient,
            subject: subject,
            html: htmlContent,
        });
    });

    await Promise.all(emailPromises);
    console.log('Emails sent successfully.');
}

app.post('/send-email', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            console.log('File not uploaded.');
            return res.status(400).send({ error: 'File not uploaded!' });
        }

        let filePath = path.join(__dirname, '../uploads/', req.file.filename);
        console.log(`File uploaded to: ${filePath}`);

        // Convert backslashes to forward slashes
        filePath = filePath.replace(/\\/g, '/');
        console.log(`Converted file path: ${filePath}`);

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data = xlsx.utils.sheet_to_json(worksheet);
        console.log('Parsed data from Excel file:', data);

        // Extract email addresses using correct key casing
        const recipients = data.map(row => row.Email).filter(email => email);
        console.log('Extracted email addresses:', recipients);

        if (recipients.length === 0) {
            console.log('No valid email addresses found in the Excel file.');
            return res.status(400).send({ error: 'No valid email addresses found in the Excel file!' });
        }

        const subject = req.body.subject || 'Default Subject';
        const htmlContent = req.body.htmlContent || '<h1>Custom Email Content</h1>';

        console.log('Subject:', subject);
        console.log('HTML Content:', htmlContent);

        await sendBulkEmails(recipients, subject, htmlContent);

        fs.unlinkSync(filePath);
        console.log('Uploaded file deleted successfully.');

        res.status(200).send({ message: 'Emails sent successfully!' });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send({ error: 'Error sending emails' });
    }
});


module.exports = app;
