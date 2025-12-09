import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TeamsPage from "./pages/TeamsPage";
import RetroBoardPage from "./pages/RetroBoardPage";
import LoaderTest from "./pages/LoaderTest";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Layout component keeps navigation and page structure consistent across the whole site

const Layout = () => {
  const location = useLocation();
  const isGradientPage = location.pathname === "/" || location.pathname === "/dashboard";
  const isRetroBoardPage = location.pathname.startsWith("/retro-board");
  const isDashboard = location.pathname === "/dashboard";
  const isLoaderTest = location.pathname === "/loader-test";
  
  let appClass = "app";
  if (isGradientPage || isLoaderTest) appClass += " homepage-gradient";
  if (isRetroBoardPage) appClass += " retroboard-gradient";
  if (isDashboard) appClass += " dashboard-page";
  
  return (
    <div className={appClass}>
      <NavBar />
      <main className="main-content">
        <Outlet /> {/* child routes render here */}
      </main>
    </div>
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
      { path: "/loader-test", element: <LoaderTest />},
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
