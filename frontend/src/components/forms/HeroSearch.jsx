import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { TextInput } from "./TextInput";

export function HeroSearch({ locations = [], compact = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    location: params.get("location") ?? "",
    check_in: params.get("check_in") ?? "",
    check_out: params.get("check_out") ?? "",
    guests: params.get("guests") ?? "",
  });

  useEffect(() => {
    setForm({
      location: params.get("location") ?? "",
      check_in: params.get("check_in") ?? "",
      check_out: params.get("check_out") ?? "",
      guests: params.get("guests") ?? "",
    });
  }, [params]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (form.location) qs.set("location", form.location);
    if (form.check_in) qs.set("check_in", form.check_in);
    if (form.check_out) qs.set("check_out", form.check_out);
    if (form.guests) qs.set("guests", form.guests);
    navigate(`/search?${qs.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "grid",
        gridTemplateColumns: compact
          ? "repeat(auto-fit, minmax(160px, 1fr)) 130px"
          : "repeat(auto-fit, minmax(200px, 1fr)) 150px",
        gap: "var(--space-3)",
        alignItems: "end",
        padding: compact ? "var(--space-3)" : "var(--space-5)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: compact ? "none" : "var(--shadow-card)",
      }}
    >
      <label style={{ display: "block" }}>
        <span style={{ display: "block", marginBottom: "var(--space-1)", fontSize: "0.9rem" }}>
          {t("search.location")}
        </span>
        <select
          value={form.location}
          onChange={update("location")}
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            minHeight: 44,
            fontFamily: "inherit",
          }}
        >
          <option value="">{t("search.allLocations")}</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.slug}>
              {loc.name} · {loc.country}
            </option>
          ))}
        </select>
      </label>
      <TextInput
        label={t("search.checkIn")}
        type="date"
        value={form.check_in}
        onChange={update("check_in")}
      />
      <TextInput
        label={t("search.checkOut")}
        type="date"
        value={form.check_out}
        onChange={update("check_out")}
      />
      <TextInput
        label={t("search.guests")}
        type="number"
        min="1"
        value={form.guests}
        onChange={update("guests")}
      />
      <button
        type="submit"
        style={{
          padding: "var(--space-3) var(--space-4)",
          minHeight: 44,
          background: "var(--color-brand)",
          color: "#fff",
          border: 0,
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
        }}
      >
        {t("search.submit")}
      </button>
    </form>
  );
}
