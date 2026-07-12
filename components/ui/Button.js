import Link from "next/link";

const variants = {
  primary:
    "bg-gold text-white hover:bg-[#b8944f] border border-gold",
  secondary:
    "bg-dark text-white hover:bg-[#3a3a3a] border border-dark",
  outline:
    "bg-transparent text-dark border border-dark hover:bg-dark hover:text-white",
  ghost:
    "bg-transparent text-dark hover:bg-accent/40 border border-transparent",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1fb855] border border-[#25D366]",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 rounded-sm ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
      return (
        <a href={href} className={classes} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
