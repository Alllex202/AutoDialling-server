const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');

const transporter = nodemailer.createTransport(
    {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
            user: emailConfig.user,
            pass: emailConfig.pass,
        },
    },
    {
        from: `${emailConfig.name} <${emailConfig.user}>`
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