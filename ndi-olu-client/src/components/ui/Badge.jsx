const variants = {
  verified: "bg-emerald-50 text-emerald-800 ring-emerald-700/15",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  accent: "bg-orange-50 text-orange-800 ring-orange-700/15",
};

function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;