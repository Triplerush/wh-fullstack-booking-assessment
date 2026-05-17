const KEY = "wh.bookingDraft";

export const draftStorage = {
  save(draft) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(draft));
    } catch (_e) {
      // sessionStorage puede no estar disponible (modo privado); se ignora.
    }
  },
  read() {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch (_e) {
      // se ignora
    }
  },
};
