const nodemailer = require("nodemailer");

const sendMail = async (subject, title, message, recipients) => {
    let messageToSend = `<h2>${title}</h2>`;
    const messageRecipients = recipients;

    messageToSend += `<p>${message}</p>`

    const transporter = nodemailer.createTransport({
        host: "smtppro.zoho.com",
        port: 465,
        secure: "SSL",
        tls: {rejectUnauthorized: false},
        auth: {user: "noreply@jorendben.hu", pass:"0SdDhZcXnfD6"}
    });

    let response;

    try {
        response = await transporter.sendMail({
            from: "noreply@jorendben.hu",
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