import { useEffect, useState } from "react";

const listeners = new Set();
let nextId = 1;

export function pushToast({ message, variant = "info", timeoutMs = 4500 }) {
  const id = nextId++;
  const item = { id, message, variant, timeoutMs };
  listeners.forEach((fn) => fn({ type: "add", item }));
  return id;
}

export function dismissToast(id) {
  listeners.forEach((fn) => fn({ type: "remove", id }));
}

export function ToastStack() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    function onEvent(ev) {
      if (ev.type === "add") {
        setItems((prev) => [...prev, ev.item]);
      } else if (ev.type === "remove") {
        setItems((prev) => prev.filter((it) => it.id !== ev.id));
      }
    }
    listeners.add(onEvent);
    return () => listeners.delete(onEvent);
  }, []);

  useEffect(() => {
    const timers = items
      .filter((it) => it.timeoutMs > 0)
      .map((it) => setTimeout(() => dismissToast(it.id), it.timeoutMs));
    return () => timers.forEach(clearTimeout);
  }, [items]);

  if (!items.length) return null;
  return (
    <div className="toast-stack" role="region" aria-label="notifications">
      {items.map((it) => (
        <div key={it.id} className={`toast ${it.variant}`} role="status">
          <span>{it.message}</span>
          <button
            type="button"
            aria-label="dismiss"
            onClick={() => dismissToast(it.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
