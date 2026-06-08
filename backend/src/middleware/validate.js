const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const detail = errors.array().map(e => e.msg).join(', ');
    return res.status(422).json({ detail });
  }
  next();
};
