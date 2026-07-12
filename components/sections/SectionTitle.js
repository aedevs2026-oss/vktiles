import Link from "next/link";

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}) {
  const alignClass =
    align === "center"
      ? "text-center items-center"
      : "text-left items-start";

  return (
    <div className={`flex flex-col gap-4 mb-12 md:mb-16 ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-dark text-balance leading-tight">
          {title}
        </h2>
      )}
      <div className="gold-line" aria-hidden="true" />
      {subtitle && (
        <p className={`text-gray text-base md:text-lg max-w-2xl leading-relaxed ${align === "center" ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
