const Resend = require("resend")
require("dotenv").config()

const Mailer = (from,to,subject,html)=>{

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    resend.emails.send({
        from:  from,
        to:  to,
        subject: subject,
        html: html
    });
}

module.exports = Mailer