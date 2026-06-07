const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = async function (req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ detail: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db('users').where({ email: payload.sub }).first();
    if (!user) return res.status(401).json({ detail: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: 'Invalid token' });
  }
};
