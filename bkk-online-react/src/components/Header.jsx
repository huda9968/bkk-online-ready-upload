import { SignIn, UserPlus, SignOut, AppWindow } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <header className="header">
            <div className="container navbar">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div className="logo-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <img src="/logo-sekolah.png" alt="Logo Sekolah" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
                            <img src="/logo-bkk.png" alt="Logo BKK" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <div>
                            <h1 className="logo" style={{ marginBottom: '4px', lineHeight: 1 }}>BKK SMK Raden Rahmat</h1>
                            <p className="subtitle" style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1 }}>Bursa Kerja Khusus Skadera</p>
                        </div>
                    </div>
                </Link>

                <div className="nav-buttons">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="btn btn-light" style={{ textDecoration: 'none' }}>
                                <AppWindow weight="bold" /> Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-primary" style={{ backgroundColor: '#ef4444' }}>
                                <SignOut weight="bold" /> Keluar
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-light" style={{ textDecoration: 'none' }}>
                                <SignIn weight="bold" /> Login
                            </Link>
                            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                <UserPlus weight="bold" /> Daftar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
