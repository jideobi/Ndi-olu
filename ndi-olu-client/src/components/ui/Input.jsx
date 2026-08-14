function Input({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}) {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={messageId}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 focus:border-ndi-forest focus:ring-emerald-100"
        } ${className}`}
        {...props}
      />

      {error && (
        <p id={messageId} className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={messageId} className="mt-2 text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export default Input;