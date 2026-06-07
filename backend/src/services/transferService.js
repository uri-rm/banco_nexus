const db = require('../db');
const { validateAccountNumber } = require('../helpers/validation');
const audit = require('./auditService');

async function transfer(sender, destinyNumber, amount, description) {
  if (!validateAccountNumber(destinyNumber)) {
    await audit.transferFailed(sender, `cuenta destino mal formada: ${destinyNumber}`);
    const e = new Error('Número de cuenta inválido'); e.status = 400; throw e;
  }

  return db.transaction(async (trx) => {
    const src = await trx('users').where({ id: sender.id }).forUpdate().first();
    const dst = await trx('users').where({ number: destinyNumber }).forUpdate().first();

    if (!dst) {
      await audit.transferFailed(sender, `cuenta destino inexistente: ${destinyNumber}`);
      const e = new Error('Num typed doesnt correspond to any user'); e.status = 404; throw e;
    }
    if (src.balance < amount) {
      await audit.transferFailed(sender, `saldo insuficiente: monto ${amount}, saldo ${src.balance}`);
      const e = new Error('Insufficient balance'); e.status = 400; throw e;
    }

    await trx('users').where({ id: src.id }).update({ balance: src.balance - amount });
    await trx('users').where({ id: dst.id }).update({ balance: dst.balance + amount });

    const [txId] = await trx('transactions').insert({
      user_id: src.id,
      target_user_id: dst.id,
      type: 'transfer',
      amount,
      balance_after: src.balance - amount,
      description: description || `transfer a ${destinyNumber}`,
      date: new Date(),
    });

    const tx = await trx('transactions').where({ id: txId }).first();
    await audit.transferApproved(sender, `transfer de ${amount} - balance: ${src.balance - amount}`);
    return tx;
  });
}

module.exports = { transfer };
