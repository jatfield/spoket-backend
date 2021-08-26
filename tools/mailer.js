const nodemailer = require("nodemailer");

const sendMail = async (subject, title, message, recipients) => {
    let messageToSend = `<h2>${title}</h2>`;
    const messageRecipients = recipients;

    messageToSend += `<p>${message}</p>`

    const transporter = nodemailer.createTransport({
        host: process.env.SPOKET_MAILER_HOST,
        port: process.env.SPOKET_MAILER_PORT,
        secure: process.env.SPOKET_MAILER_SECURE,
        tls: {rejectUnauthorized: false},
        auth: {user: process.env.SPOKET_MAILER_USER, pass: process.env.SPOKET_MAILER_PASSWORD}
    });

    let response;

    try {
        response = await transporter.sendMail({
            from: process.env.SPOKET_MAILER_FROM_ADDRESS,
            to: messageRecipients,
            subject,
            text: messageToSend,
            html: messageToSend
        })
    } catch (error) {
      console.log(error.message);    
    }

    return {message: response.messageId}
}

module.exports = sendMail;