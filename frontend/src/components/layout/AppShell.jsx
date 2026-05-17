import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, padding: "var(--space-5)" }}>
        {children ?? (
          <section>
            <h2>Wind Homes</h2>
            <p>Bootstrap shell. Páginas reales aterrizan en las siguientes iteraciones.</p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
