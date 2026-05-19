import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user } = useAuth();

    // Jika user belum login, lemparkan kembali ke halaman login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Jika user sudah login, render komponen anak (halaman yang dilindungi)
    return children;
}
