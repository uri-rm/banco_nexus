const router = require('express').Router();
const argon2 = require('argon2');
const db = require('../db');
const auth = require('../middleware/auth');
const { validateAccountNumber } = require('../helpers/validation');

const userFields = ['id', 'username', 'email', 'number', 'balance'];

// GET /users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id }).select(userFields).first();
    res.json(user);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT /users/me
router.put('/me', auth, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) {
      const existing = await db('users').where({ email }).whereNot({ id: req.user.id }).first();
      if (existing) return res.status(409).json({ detail: 'Email already in use' });
      updates.email = email;
    }
    if (password) updates.password = await argon2.hash(password);

    if (Object.keys(updates).length > 0) {
      await db('users').where({ id: req.user.id }).update(updates);
    }

    const user = await db('users').where({ id: req.user.id }).select(userFields).first();
    res.json(user);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /users/add_account/:num_destiny_account
router.post('/add_account/:num', auth, async (req, res) => {
  try {
    const { num } = req.params;
    const { name } = req.body;

    if (num === req.user.number) {
      return res.status(400).json({ detail: 'No puedes agregar tu propia cuenta como destino' });
    }
    if (!validateAccountNumber(num)) {
      return res.status(400).json({ detail: 'Invalid account number' });
    }

    const destinyUser = await db('users').where({ number: num }).first();
    if (!destinyUser) return res.status(404).json({ detail: 'Destiny account not found' });

    const existing = await db('destinyaccount')
      .where({ user_id: req.user.id, number_user: num })
      .first();
    if (existing) return res.status(409).json({ detail: 'Destiny account already added' });

    const resolvedName = (name && name.trim()) || destinyUser.username || 'Cuenta destino';
    await db('destinyaccount').insert({ name: resolvedName, number_user: num, user_id: req.user.id });

    const user = await db('users').where({ id: req.user.id }).select(userFields).first();
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ detail: 'Destiny account already added' });
    res.status(500).json({ detail: err.message });
  }
});

// GET /users/destiny_accounts
router.get('/destiny_accounts', auth, async (req, res) => {
  try {
    const accounts = await db('destinyaccount')
      .where({ user_id: req.user.id })
      .select('name', 'number_user');
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// DELETE /users/remove_account/:num_destiny_account
router.delete('/remove_account/:num', auth, async (req, res) => {
  try {
    const { num } = req.params;
    const deleted = await db('destinyaccount')
      .where({ user_id: req.user.id, number_user: num })
      .delete();
    if (!deleted) return res.status(404).json({ detail: 'Destiny account not found' });

    const user = await db('users').where({ id: req.user.id }).select(userFields).first();
    res.json(user);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
