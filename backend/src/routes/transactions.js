const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { validateAccountNumber } = require('../helpers/validation');
const { transfer } = require('../services/transferService');
const audit = require('../services/auditService');

const txFields = ['id', 'date', 'type', 'amount', 'balance_after', 'description'];

// GET /transactions/
router.get('/', auth, async (req, res) => {
  try {
    const txs = await db('transactions')
      .where({ user_id: req.user.id })
      .select(txFields);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /transactions/  (depósito o retiro propio)
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const user = await db('users').where({ id: req.user.id }).first();

    if (type === 'deposit') {
      await db('users').where({ id: user.id }).update({ balance: user.balance + amount });
      await audit.deposit(user, `deposito de ${amount}`);
    } else if (type === 'withdrawal') {
      if (user.balance < amount) {
        await audit.transferFailed(user, `saldo insuficiente: monto ${amount}, saldo ${user.balance}`);
        return res.status(400).json({ detail: 'Insufficient balance' });
      }
      await db('users').where({ id: user.id }).update({ balance: user.balance - amount });
      await audit.withdrawal(user, `retiro de ${amount}`);
    } else {
      await audit.transferFailed(user, `tipo de operación inválido: ${type}`);
      return res.status(422).json({ detail: 'Type of action invalid' });
    }

    const newBalance = type === 'deposit' ? user.balance + amount : user.balance - amount;
    const [txId] = await db('transactions').insert({
      user_id: user.id,
      type,
      amount,
      balance_after: newBalance,
      description: description || `${type} a mi mismo`,
      date: new Date(),
    });

    const tx = await db('transactions').where({ id: txId }).select(txFields).first();
    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /transactions/:num  (transferencia a otra cuenta)
router.post('/:num', auth, async (req, res) => {
  try {
    const { num } = req.params;
    const { type, amount, description } = req.body;

    if (type !== 'deposit') {
      const user = await db('users').where({ id: req.user.id }).first();
      await audit.transferFailed(user, `tipo de operación inválido: ${type}`);
      return res.status(422).json({ detail: 'Type of action invalid' });
    }

    const tx = await transfer(req.user, num, amount, description);
    res.status(201).json({
      id: tx.id,
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      balance_after: tx.balance_after,
      description: tx.description,
    });
  } catch (err) {
    res.status(err.status || 500).json({ detail: err.message });
  }
});

module.exports = router;
