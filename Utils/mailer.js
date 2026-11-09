 const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const Mailer = async (to, subject, html) => {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Email failed: ${error.message}`);
  }
  return data;
};

module.exports = Mailer;