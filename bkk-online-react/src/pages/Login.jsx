import { EnvelopeSimple, LockKey, SignIn, WarningCircle } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signIn({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Berhasil login
            navigate("/");
        }
    };

    return (
        <section className="auth-section">
            <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div className="auth-card job-card" style={{ maxWidth: '450px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Selamat Datang</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Masuk ke akun BKK Online Anda</p>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <WarningCircle size={20} weight="bold" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="search-box">
                                <EnvelopeSimple weight="bold" />
                                <input 
                                    type="email" 
                                    placeholder="contoh@email.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label className="form-label">Password</label>
                            <div className="search-box">
                                <LockKey weight="bold" />
                                <input 
                                    type="password" 
                                    placeholder="Masukkan password Anda" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '25px', padding: '16px', justifyContent: 'center' }}>
                            {loading ? "Memproses..." : <><SignIn weight="bold" size={20} /> Masuk Sekarang</>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Belum punya akun? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Daftar di sini</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
