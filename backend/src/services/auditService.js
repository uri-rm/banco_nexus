const db = require('../db');

const log = (row) => db('audit_logs').insert({ timestamp: new Date(), ...row });

module.exports = {
  loginSuccess:      (u)     => log({ user_id: u.id, username: u.username, action: 'login_exitoso',           status: 'exitoso' }),
  loginFailed:       (email) => log({ username: email,                      action: 'login_fallido',           status: 'fallido',  detail: 'credenciales inválidas' }),
  accountCreated:    (u)     => log({ user_id: u.id, username: u.username, action: 'alta_de_cuenta',          status: 'exitoso' }),
  transferApproved:  (u, d)  => log({ user_id: u.id, username: u.username, action: 'transferencia_aprobada',  status: 'exitoso',  detail: d }),
  transferFailed:    (u, d)  => log({ user_id: u?.id, username: u?.username, action: 'transferencia_rechazada', status: 'fallido', detail: d }),
  deposit:           (u, d)  => log({ user_id: u.id, username: u.username, action: 'deposito',                status: 'exitoso',  detail: d }),
  withdrawal:        (u, d)  => log({ user_id: u.id, username: u.username, action: 'retiro',                  status: 'exitoso',  detail: d }),
};
