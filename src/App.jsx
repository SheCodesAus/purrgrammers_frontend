import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TeamsPage from "./pages/TeamsPage";
import RetroBoardPage from "./pages/RetroBoardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Layout component keeps navigation and page structure consistent across the whole site

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  return (
    <div className={`app ${isHomePage ? 'homepage-gradient' : ''}`}>
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
