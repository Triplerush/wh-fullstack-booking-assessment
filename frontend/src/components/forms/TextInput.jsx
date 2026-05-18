import { forwardRef } from "react";

import { FormError } from "./FormError";

export const TextInput = forwardRef(function TextInput(
  { label, error, type = "text", className = "", ...rest },
  ref,
) {
  return (
    <label className={`field ${className}`}>
      {label ? <span className="field-label">{label}</span> : null}
      <input
        ref={ref}
        type={type}
        aria-invalid={error ? "true" : undefined}
        className={`field-input${error ? " error" : ""}`}
        {...rest}
      />
      <FormError>{error}</FormError>
    </label>
  );
});
