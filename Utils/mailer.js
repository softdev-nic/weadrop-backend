 const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY); // create once, not per email

const Mailer = async (to, subject, html) => {
    try {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
  return data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }   

};

module.exports = Mailer;