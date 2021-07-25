module.exports = {
    host: process.env.EMAIL_TRANSPORTER_HOST,
    port: process.env.EMAIL_TRANSPORTER_PORT,
    secure: Boolean(process.env.EMAIL_TRANSPORTER_SECURE),
    user: process.env.EMAIL_TRANSPORTER_USER,
    pass: process.env.EMAIL_TRANSPORTER_PASSWORD,
    name: process.env.EMAIL_TRANSPORTER_NAME || 'Tester',
};