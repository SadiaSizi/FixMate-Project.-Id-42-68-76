const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'islamsizi30@gmail.com',
        pass: 'hvhb bnfu glrk hxkm'  
    }
});

module.exports = transporter;
