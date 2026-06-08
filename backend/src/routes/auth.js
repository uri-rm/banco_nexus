const router = require('express').Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../db');
const { generateAccountNumber } = require('../helpers/validation');
const audit = require('../services/auditService');
const validate = require('../middleware/validate');

const loginRules = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

const registerRules = [
  body('username').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// POST /auth/token
router.post('/token', loginRules, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) return res.status(404).json({ detail: "User doesn't exist" });

    const ok = await argon2.verify(user.password, password);
    if (!ok) {
      await audit.loginFailed(email);
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: user.email }, process.env.JWT_SECRET, { expiresIn: '30m', algorithm: 'HS256' });
    await audit.loginSuccess(user);

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: { id: user.id, username: user.username, email: user.email, number: user.number, balance: user.balance },
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /auth/register
router.post('/register', registerRules, validate, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await db('users').where({ email }).first();
    if (exists) return res.status(409).json({ detail: 'User already exists' });

    const hash = await argon2.hash(password);
    const [id] = await db('users').insert({ username, email, password: hash, number: 'pending', balance: 0.0 });
    const number = generateAccountNumber(id);
    await db('users').where({ id }).update({ number });

    await audit.accountCreated({ id, username });
    res.status(201).json({ id, username, email, number, balance: 0.0 });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
