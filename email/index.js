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

/**
 *
 * @param mail {{to: string, subject: string, context: string | html, files: [{filename: string, path: string, content: string | ReadableStream}]}}
 * @returns {Promise<((promiseImpl?: PromiseConstructor) => Connection)|((promiseImpl?: PromiseConstructor) => PoolConnection)|((promiseImpl?: PromiseConstructor) => Pool)|(() => Promise<any>)|any>}
 */
async function sendMail(mail) {
    return transporter.sendMail({
        to: mail.to,
        subject: mail.subject,
        html: mail.context,
        attachments: mail.files,
    });
}

module.exports.sendMail = sendMail;