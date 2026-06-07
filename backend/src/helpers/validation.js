function generateAccountNumber(userId) {
  const base = '180' + String(userId).padStart(6, '0');
  const checkDigit = [...base].reduce((s, d) => s + Number(d), 0) % 10;
  return base + checkDigit;
}

function validateAccountNumber(num) {
  if (!/^\d{10}$/.test(num)) return false;
  if (!num.startsWith('180')) return false;
  const base = num.slice(0, -1);
  const check = Number(num.slice(-1));
  const sum = [...base].reduce((s, d) => s + Number(d), 0) % 10;
  return sum === check;
}

module.exports = { generateAccountNumber, validateAccountNumber };
