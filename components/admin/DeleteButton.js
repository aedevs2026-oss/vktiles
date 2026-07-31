"use client";

export default function DeleteButton({ action, label = "Delete", className = "" }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
      className={`inline ${className}`}
    >
      <button type="submit" className="text-red-600 text-sm hover:underline">
        {label}
      </button>
    </form>
  );
}
