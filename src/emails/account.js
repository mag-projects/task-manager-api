const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail = (email, name) => {
    const fullName = name.split(' ');
    const firstName = fullName[0];
    sgMail.send({
        to: email,
        from: 'miguel3042development@gmail.com',
        subject: 'Welcome to the Task App!',
        text: `Welcome to the new Task APP ${firstName}, hope you find it useful!`
    })
};

const sendCancellationEmail = (email, name) => {
    const fullName = name.split(' ');
    const firstName = fullName[0];
    sgMail.send({
        to: email,
        from: 'miguel3042development@gmail.com',
        subject: `We're sad to see you go ${firstName}`,
        text: `If you're sure about cancelling ${firstName}, would you mind responding with your reason for leaving?`
    })
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};
