const { rateLimit } = require('express-rate-limit');

const Limiter = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, limit = 5 } = options;

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      message: 'Too many requests, please try again later.'
    }
  });
};

module.exports = Limiter;
