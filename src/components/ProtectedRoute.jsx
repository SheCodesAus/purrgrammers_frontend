import { Navigate } from "react-router-dom";
import { useAuth } from '../hooks/use-auth';

function ProtectedRoute({ children }) {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/" replace />
    }

    return children;
}

export default ProtectedRoute;