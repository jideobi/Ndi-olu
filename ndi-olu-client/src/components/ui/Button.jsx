const variants = {
  primary:
    "bg-ndi-forest text-white shadow-sm hover:bg-ndi-forest-dark focus-visible:outline-ndi-forest",
  accent:
    "bg-ndi-orange text-white shadow-sm hover:bg-[#CC5730] focus-visible:outline-ndi-orange",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:border-ndi-forest hover:text-ndi-forest focus-visible:outline-ndi-forest",
  ghost:
    "bg-transparent text-ndi-forest hover:bg-emerald-50 focus-visible:outline-ndi-forest",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  href,
  ...props
}) {
  const classes = `inline-flex items-center justify-center rounded-xl font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;