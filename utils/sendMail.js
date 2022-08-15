const pug = require('pug');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.firstName = user.name.split(' ')[0]),
      (this.url = url),
      (this.from = `Admin <${process.env.EMAIL_FROM}>`);
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }
  //for sending actual email
  async send(template, subject) {
    //sending actual email
    //1) create HTML based on pug
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    //2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    //create transport
    // this.newTransport();
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family!');
  }
  async sendResetToken() {
    await this.send('passwordReset', 'Reset Your Password!');
  }
};
