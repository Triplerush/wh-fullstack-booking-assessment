export function FormError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="field-error">
      {children}
    </p>
  );
}
