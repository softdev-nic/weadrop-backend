const dns = require('dns');

const domainValidator = (req, res, next) => {
    const email = req.body.email;
    const domain = email.split('@')[1];

    dns.resolveMx(domain, (err, addresses) => {
        if (err || addresses.length === 0) {
            return res.status(400).json({ message: 'Invalid email domain' });
        }
        next();
    });
};

module.exports = domainValidator;   