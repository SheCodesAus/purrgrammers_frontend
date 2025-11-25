import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TeamsPage from "./pages/TeamsPage";

// Layout component keeps navigation and page structure consistent across the whole site

const Layout = () => {
  return (
    <div className="app">
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
    element: <Layout />, // Layout wraps all routes
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/teams", element: <TeamsPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
