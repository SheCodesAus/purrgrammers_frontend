import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../hooks/use-auth';

function ProtectedRoute({ children }) {
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        // Save the attempted URL so we can redirect after login
        return <Navigate to="/auth" state={{ from: location.pathname }} replace />
    }

    return children;
}

export default ProtectedRoute;