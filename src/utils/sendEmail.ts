import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.MAIN_EMAIL_SERVICE,
  auth: {
    user: process.env.MAIN_EMAIL_ADDRESS,
    pass: process.env.MAIN_EMAIL_PASSWORD,
  },
});

const sendEmail = (options: {
  subject: string;
  text: string;
  html: string;
  receivers: string[];
}) => {
  const receivers = options.receivers.join(', ');
  return transporter.sendMail({
    from: `"SK Chat App" <${process.env.MAIN_EMAIL_ADDRESS}>`,
    to: receivers,
    subject: options.subject.trim() + ' | SK Chat App',
    text: options.text,
    html: options.html,
  });
};

export default sendEmail;
