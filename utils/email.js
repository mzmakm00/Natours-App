const nodemailer = require('nodemailer')

const sendEmail = async options => {
    // 1) Create a transporter
    
    const transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 587, // You can use 25, 465, 587, or 2525; Mailtrap recommends 587
        secure: false, // Use true if you are using port 465
        auth: {
           user: 'b5abef3d80feeb',
           pass: '200f7f409dd7b1',
           authMethod: 'PLAIN', // You can also try 'LOGIN' or 'CRAM-MD5'
        },
        tls: {
           ciphers: 'SSLv3', // You may need to adjust this based on Mailtrap's recommendations
        },
    });     
    
    // 2) Define Email Options
    const mailOptions = {
        from : 'hello <hello@gmail.com>',
        to : options.email,
        subject : options.subject,
        text : options.message
    }
   
    // 3) Send the email 
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;
