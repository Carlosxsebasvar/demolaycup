import { Route, Switch } from "wouter";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
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
          <Route path="/" component={HomePage} />
          <Route path="/grupos" component={GruposPage} />
          <Route path="/partidos" component={PartidosPage} />
          <Route path="/llaves" component={LlavesPage} />
          <Route path="/goleadores" component={GoleadoresPage} />
          <Route path="/admin/partidos" component={AdminPartidosPage} />
          <Route path="/admin/equipos" component={AdminEquiposPage} />
          <Route path="/admin/goles" component={AdminGolesPage} />
          <Route path="/admin/torneo" component={AdminTorneoPage} />
        </Switch>
      </Layout>
    </AuthProvider>
  );
}
