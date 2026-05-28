import { Route, Switch } from "wouter";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { AdminGuard } from "./components/AdminGuard";
import HomePage from "./pages/index";
import GruposPage from "./pages/grupos";
import PartidosPage from "./pages/partidos";
import LlavesPage from "./pages/llaves";
import GoleadoresPage from "./pages/goleadores";
import AdminPartidosPage from "./pages/admin/partidos";
import AdminEquiposPage from "./pages/admin/equipos";
import AdminGolesPage from "./pages/admin/goles";
import AdminTorneoPage from "./pages/admin/torneo";

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Switch>
          {/* Páginas públicas */}
          <Route path="/" component={HomePage} />
          <Route path="/grupos" component={GruposPage} />
          <Route path="/partidos" component={PartidosPage} />
          <Route path="/llaves" component={LlavesPage} />
          <Route path="/goleadores" component={GoleadoresPage} />

          {/* Páginas admin — requieren login */}
          <Route path="/admin/partidos">
            <AdminGuard><AdminPartidosPage /></AdminGuard>
          </Route>
          <Route path="/admin/equipos">
            <AdminGuard><AdminEquiposPage /></AdminGuard>
          </Route>
          <Route path="/admin/goles">
            <AdminGuard><AdminGolesPage /></AdminGuard>
          </Route>
          <Route path="/admin/torneo">
            <AdminGuard><AdminTorneoPage /></AdminGuard>
          </Route>
        </Switch>
      </Layout>
    </AuthProvider>
  );
}
