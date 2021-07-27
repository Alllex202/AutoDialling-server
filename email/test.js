require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(
    {
        host: process.env.EMAIL_TRANSPORTER_HOST,
        port: process.env.EMAIL_TRANSPORTER_PORT,
        secure: Boolean(process.env.EMAIL_TRANSPORTER_SECURE),
        auth: {
            user: process.env.EMAIL_TRANSPORTER_USER,
            pass: process.env.EMAIL_TRANSPORTER_PASSWORD,
        },
    },
    {
        from: `Tester <${process.env.EMAIL_TRANSPORTER_USER}>`
    }
);

transporter.sendMail({
    to: process.env.EMAIL_EXPORT_TO,
    subject: 'Тестовое письмо',
    // text: 'Текст письма',
    html: 'Разметка для письма',
    attachments: [
        {
            filename: 'Отчет.xlsx',
            path: 'email/export.xlsx'
        }
    ],
})
    .then(res => console.log('done', res))
    .catch(er => console.log('er', er));

