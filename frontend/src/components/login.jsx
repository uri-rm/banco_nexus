import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDollarSign, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { login } from '@/api/conf';

export default function LoginBancoNexus({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [flash,     setFlash]     = useState(null);

  const validate = () => {
    const errs = {};
    if (!email.trim())                    errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email';
    if (!password)                        errs.password = 'Password is required';
    else if (password.length < 6)         errs.password = 'Minimum 6 characters';
    return errs;
  };

  const handleSubmit = async () => {
    setFlash(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await login({
        email: email.trim(),
        password,
      });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setFlash({ type: 'success', text: 'Access granted! Redirecting...' });
      if (onLoginSuccess) onLoginSuccess(res.data);
      navigate('/dashboard');
    } catch (err) {
      setFlash({
        type: 'error',
        text: err.response?.data?.detail || 'Incorrect email or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, next) => {
    if (e.key === 'Enter') next ? next() : handleSubmit();
  };

  const fieldClass = (name) =>
    `w-full pl-9 pr-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-all duration-150
     text-neutral-100 placeholder-neutral-500
     ${errors[name]
       ? 'border-red-500 focus:ring-1 focus:ring-red-500'
       : 'border-neutral-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <header className="py-2 px-4 border-b-2 border-sky-700 mb-8 flex items-center gap-2">
          <FaDollarSign className="text-4xl text-green-500" />
          <h2 className="font-bold text-neutral-100">Financial Dashboard — Banco Nexus</h2>
        </header>

        {/* Card */}
        <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">

          <div className="px-6 pt-6 pb-2">
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">Sign in</h1>
            <p className="text-sm text-neutral-400 mb-5">Enter your credentials to access your account</p>

            {/* Flash */}
            {flash && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded mb-4 border
                ${flash.type === 'success'
                  ? 'bg-green-950 border-green-700 text-green-400'
                  : 'bg-red-950 border-red-700 text-red-400'}`}>
                {flash.type === 'success'
                  ? <FaCheckCircle className="shrink-0" />
                  : <FaTimesCircle className="shrink-0" />}
                <span>{flash.text}</span>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs text-neutral-400 mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                  onKeyDown={e => handleKeyDown(e, () => document.getElementById('nx-pass').focus())}
                  className={fieldClass('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-xs text-neutral-400 mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
                <input
                  id="nx-pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  onKeyDown={e => handleKeyDown(e, null)}
                  className={`${fieldClass('password')} pr-9`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2 rounded-md text-sm font-medium transition-all duration-150
                bg-sky-700 hover:bg-sky-600 active:scale-95
                text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 mt-4 border-t border-neutral-800 text-center">
            <p className="text-xs text-neutral-600">© 2025 Banco Nexus — Secure access</p>
          </div>
        </div>
      </div>
    </div>
  );
}