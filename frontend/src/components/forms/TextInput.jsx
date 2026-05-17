import { forwardRef } from "react";
import { FormError } from "./FormError";

export const TextInput = forwardRef(function TextInput(
  { label, error, type = "text", ...rest },
  ref,
) {
  return (
    <label style={{ display: "block", marginBottom: "var(--space-3)" }}>
      <span style={{ display: "block", marginBottom: "var(--space-1)", fontSize: "0.9rem" }}>
        {label}
      </span>
      <input
        ref={ref}
        type={type}
        style={{
          width: "100%",
          padding: "var(--space-2) var(--space-3)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          minHeight: "44px",
          fontFamily: "inherit",
        }}
        {...rest}
      />
      <FormError>{error}</FormError>
    </label>
  );
});
