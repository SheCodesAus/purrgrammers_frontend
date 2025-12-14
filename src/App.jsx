import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TeamsPage from "./pages/TeamsPage";
import RetroBoardPage from "./pages/RetroBoardPage";
import HelpCenter from "./pages/HelpCenter";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// Layout component keeps navigation and page structure consistent across the whole site

const Layout = () => {
  const location = useLocation();
  const isGradientPage = location.pathname === "/" || location.pathname === "/dashboard" || location.pathname === "/help" || location.pathname === "/about";
  const isRetroBoardPage = location.pathname.startsWith("/retro-board");
  const isDashboard = location.pathname === "/dashboard";
  const isNotFound = !['/', '/login', '/signup', '/dashboard', '/teams', '/help', '/about'].includes(location.pathname) && !location.pathname.startsWith('/retro-board');
  
  let appClass = "app";
  if (isGradientPage) appClass += " homepage-gradient";
  if (isRetroBoardPage) appClass += " retroboard-gradient";
  if (isDashboard) appClass += " dashboard-page";
  if (isNotFound) appClass += " homepage-gradient";
  
  return (
    <ErrorBoundary>
      <div className={appClass}>
        <NavBar />
        <main className="main-content">
          <Outlet /> {/* child routes render here */}
        </main>
      </div>
    </ErrorBoundary>
  );
};

// This is our router configuration

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage />},
      { path: "/login", element: <AuthPage />},
      { path: "/signup", element: <AuthPage />},
      { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "/teams", element: <ProtectedRoute><TeamsPage /></ProtectedRoute>},
      { path: "/retro-board/:id", element: <ProtectedRoute><RetroBoardPage /></ProtectedRoute>},
      { path: "/help", element: <HelpCenter />},
      { path: "/about", element: <About />},
      { path: "*", element: <NotFound />},
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
