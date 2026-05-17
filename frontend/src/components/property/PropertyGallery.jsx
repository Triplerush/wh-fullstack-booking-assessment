import { useState } from "react";

export function PropertyGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return (
      <div
        style={{
          height: 360,
          background: "var(--color-surface-alt)",
          borderRadius: "var(--radius-md)",
        }}
      />
    );
  }
  const current = images[active] ?? images[0];
  return (
    <div>
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background: "var(--color-surface-alt)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <img
          src={current.url}
          alt={current.alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      {images.length > 1 ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "var(--space-3) 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
            gap: "var(--space-2)",
          }}
        >
          {images.map((img, idx) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(idx)}
                aria-pressed={idx === active}
                style={{
                  display: "block",
                  width: "100%",
                  padding: 0,
                  border:
                    idx === active
                      ? "2px solid var(--color-brand-accent)"
                      : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "var(--color-surface-alt)",
                  aspectRatio: "1 / 1",
                }}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
