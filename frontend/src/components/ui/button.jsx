export function Button({ children, className = '', variant = 'default', ...props }) {
  const variants = {
    default: 'bg-white text-gray-800 border border-gray-300 transition duration-300 ease-in-out hover:bg-gray-50 px-4 py-2 rounded font-semibold',
    danger:  'bg-red-500  text-white border border-red-600  transition duration-300 ease-in-out hover:bg-red-600 px-4 py-2 rounded font-semibold',
    warning: 'bg-amber-400 text-amber-900 border border-amber-500 transition duration-300 ease-in-out hover:bg-amber-500 px-4 py-2 rounded font-semibold',
    success: 'bg-green-700 text-white border border-green-600 transition duration-300 ease-in-out hover:bg-green-600 px-4 py-2 rounded font-semibold',
  };

  return (
    <button
      type="button"
      className={`button ${variants[variant] ?? variants.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}