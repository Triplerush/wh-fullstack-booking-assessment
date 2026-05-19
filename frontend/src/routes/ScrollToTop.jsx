import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router conserva el scroll entre navegaciones (comportamiento por
// defecto). En este flujo el usuario suele venir desplazado (detalle de
// propiedad → checkout → confirmación), y aterrizar a media página da una
// impresión rota. Forzamos scroll al tope en cada cambio de pathname.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
