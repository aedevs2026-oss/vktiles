export const ui = {
  label: "block text-xs font-semibold uppercase tracking-wide text-gray mb-1.5",
  input:
    "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-navy placeholder:text-slate-400 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20 transition-colors shadow-sm",
  textarea:
    "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-navy placeholder:text-slate-400 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20 transition-colors shadow-sm",
  select:
    "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-navy focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20 transition-colors shadow-sm",
  section:
    "bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_-12px_rgba(11,31,58,0.1)]",
  sectionTitle: "font-display text-lg text-navy",
  sectionDesc: "text-xs text-gray mt-1",
  checkbox: "flex items-center gap-2 text-sm text-navy/80",
  hint: "text-xs text-gray",
  infoBox: "rounded-xl bg-gradient-to-br from-sky-soft/80 to-white border border-sky/20 p-4 text-xs text-navy/70 space-y-1",
  btnPrimary:
    "px-5 py-2.5 bg-gradient-to-r from-sky to-sky-bright text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky/25 disabled:opacity-60 transition-all",
  btnSecondary:
    "px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-navy/80 hover:bg-slate-50 hover:border-slate-300 transition-colors",
  btnGhost:
    "px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl text-sm text-navy font-medium hover:from-sky-soft hover:to-white border border-slate-200/80 transition-all",
  btnOutlineSky:
    "px-5 py-2.5 border border-sky/40 text-sky rounded-xl text-sm font-medium hover:bg-sky-soft/50 hover:border-sky/60 transition-all",
  error: "text-red-600 text-sm",
  success: "text-green-600 text-sm",
  alertError: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3",
  table: "w-full text-sm text-navy/80",
  thead: "bg-gradient-to-r from-slate-50 to-sky-soft/30 text-left text-xs uppercase tracking-wide text-gray",
  th: "px-4 py-3.5 font-semibold",
  tr: "border-t border-slate-100",
  td: "px-4 py-3.5",
  link: "inline-flex items-center gap-1 text-sky hover:text-sky-bright font-medium transition-colors",
  empty: "px-4 py-12 text-center text-gray",
  badge:
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
};

export function AdminField({ label, name, defaultValue, required, type = "text", placeholder }) {
  return (
    <div>
      <label className={ui.label}>{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className={ui.input}
      />
    </div>
  );
}

export function AdminTextArea({ label, name, defaultValue, rows = 3 }) {
  return (
    <div>
      <label className={ui.label}>{label}</label>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} className={ui.textarea} />
    </div>
  );
}

export function AdminSection({ title, description, children, accent }) {
  return (
    <section className={`${ui.section} relative overflow-hidden`}>
      {accent && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
      )}
      {(title || description) && (
        <div>
          {title && <h2 className={ui.sectionTitle}>{title}</h2>}
          {description && <p className={ui.sectionDesc}>{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
