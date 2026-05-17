export function FormError({ children }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      style={{
        color: "#b91c1c",
        fontSize: "0.85rem",
        margin: "var(--space-1) 0 0",
      }}
    >
      {children}
    </p>
  );
}
