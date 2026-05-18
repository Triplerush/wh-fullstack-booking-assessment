import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

export function HeroSearch({ locations = [], inline = false }) {
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
      className={`search-card${inline ? " inline" : ""}`}
      role="search"
    >
      <label className="search-field">
        <span className="field-icon" aria-hidden="true">◎</span>
        <span>
          <small>{t("search.location")}</small>
          <select value={form.location} onChange={update("location")}>
            <option value="">{t("search.allLocations")}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.slug}>
                {loc.name} · {loc.country}
              </option>
            ))}
          </select>
        </span>
      </label>
      <label className="search-field">
        <span className="field-icon" aria-hidden="true">◴</span>
        <span>
          <small>{t("search.checkIn")}</small>
          <input type="date" value={form.check_in} onChange={update("check_in")} />
        </span>
      </label>
      <label className="search-field">
        <span className="field-icon" aria-hidden="true">◵</span>
        <span>
          <small>{t("search.checkOut")}</small>
          <input type="date" value={form.check_out} onChange={update("check_out")} />
        </span>
      </label>
      <label className="search-field">
        <span className="field-icon" aria-hidden="true">☻</span>
        <span>
          <small>{t("search.guests")}</small>
          <input
            type="number"
            min="1"
            value={form.guests}
            onChange={update("guests")}
            placeholder={t("search.guestsPlaceholder")}
          />
        </span>
      </label>
      <button type="submit" className="search-submit">
        {t("search.submit")}
      </button>
    </form>
  );
}
