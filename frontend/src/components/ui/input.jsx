export function Input({ className = '', label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">

      {label && (
        <label className="text-sm font-medium text-neutral-300">
          {label}
        </label>
      )}

      <input
        className={`
          w-full px-3 py-2 rounded-md text-sm
          bg-gray-800 text-neutral-100
          border border-neutral-700
          outline-none
          transition-all duration-200
          placeholder:text-neutral-500
          hover:border-sky-600
          focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20
          disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-neutral-900
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

    </div>
  );
}