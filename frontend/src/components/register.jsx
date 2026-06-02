import { useState } from 'react';
import { register } from '@/api/conf';
import {
  FaDollarSign, FaUser, FaEnvelope, FaLock,
  FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

export default function RegisterBancoNexus({ onRegisterSuccess, onGoToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [flash,    setFlash]    = useState(null);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    setFlash(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())
      errs.name = 'Name is required';
    else if (form.name.trim().length < 3)
      errs.name = 'Minimum 3 characters';

    if (!form.email.trim())
      errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email';

    if (!form.password)
      errs.password = 'Password is required';
    else if (form.password.length < 6)
      errs.password = 'Minimum 6 characters';

    if (!form.confirm)
      errs.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password)
      errs.confirm = 'Passwords do not match';

    return errs;
  };

  const handleSubmit = async () => {
    setFlash(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await register({
        username: form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
      });
      setFlash({ type: 'success', text: 'Account created successfully!' });
      if (onRegisterSuccess) onRegisterSuccess(res.data);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setFlash({
        type: 'error',
        text: err.response?.data?.detail || 'Error creating account. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, nextId) => {
    if (e.key === 'Enter') {
      if (nextId) document.getElementById(nextId)?.focus();
      else handleSubmit();
    }
  };

  const inputClass = (field) =>
    `w-full pl-9 pr-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-all duration-150
     text-neutral-100 placeholder-neutral-500
     ${errors[field]
       ? 'border-red-500 focus:ring-1 focus:ring-red-500'
       : 'border-neutral-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'}`;

  const fields = [
    { id: 'nx-name',     field: 'name',     label: 'Full name',        type: 'text',     Icon: FaUser,     placeholder: 'e.g. John Doe',         next: 'nx-email',    autoComplete: 'name' },
    { id: 'nx-email',    field: 'email',    label: 'Email',            type: 'email',    Icon: FaEnvelope, placeholder: 'email@example.com',      next: 'nx-pass',     autoComplete: 'email' },
    { id: 'nx-pass',     field: 'password', label: 'Password',         type: 'password', Icon: FaLock,     placeholder: 'Minimum 6 characters',   next: 'nx-confirm',  autoComplete: 'new-password' },
    { id: 'nx-confirm',  field: 'confirm',  label: 'Confirm password', type: 'password', Icon: FaLock,     placeholder: 'Repeat your password',   next: null,          autoComplete: 'new-password' },
  ];

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
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">Create account</h1>
            <p className="text-sm text-neutral-400 mb-5">Fill in your details to register</p>

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

            {/* Fields */}
            {fields.map(({ id, field, label, type, Icon, placeholder, next, autoComplete }) => {
              const isPass = type === 'password';
              return (
                <div className="mb-4" key={field}>
                  <label className="block text-xs text-neutral-400 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
                    <input
                      id={id}
                      type={isPass ? (showPass ? 'text' : 'password') : type}
                      placeholder={placeholder}
                      value={form[field]}
                      onChange={set(field)}
                      onKeyDown={(e) => handleKeyDown(e, next)}
                      className={`${inputClass(field)} ${isPass ? 'pr-9' : ''}`}
                      autoComplete={autoComplete}
                    />
                    {isPass && (
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                      >
                        {showPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    )}
                  </div>
                  {errors[field] && (
                    <p className="text-xs text-red-400 mt-1">{errors[field]}</p>
                  )}
                </div>
              );
            })}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2 mt-1 rounded-md text-sm font-medium transition-all duration-150
                bg-sky-700 hover:bg-sky-600 active:scale-95
                text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>

            {/* Go to login */}
            {onGoToLogin && (
              <p className="text-center text-xs text-neutral-500 mt-4">
                Already have an account?{' '}
                <button
                  onClick={onGoToLogin}
                  className="text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="px-6 py-3 mt-4 border-t border-neutral-800 text-center">
            <p className="text-xs text-neutral-600">© 2025 Banco Nexus — Secure registration</p>
          </div>
        </div>

      </div>
    </div>
  );
}