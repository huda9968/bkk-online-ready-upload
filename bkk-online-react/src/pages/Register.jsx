import { EnvelopeSimple, LockKey, UserPlus, IdentificationCard, Buildings, GraduationCap, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const [role, setRole] = useState("alumni");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const { data, error } = await signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccessMsg("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi atau langsung login.");
            // Optional: navigate to login after a few seconds
            setTimeout(() => navigate('/login'), 3000);
        }
        setLoading(false);
    };

    return (
        <section className="auth-section">
            <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div className="auth-card job-card" style={{ maxWidth: '500px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Buat Akun</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Bergabung dengan BKK Online hari ini</p>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <WarningCircle size={20} weight="bold" /> {error}
                        </div>
                    )}

                    {successMsg && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <CheckCircle size={20} weight="bold" /> {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleRegister}>
                        
                        <div className="role-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '25px' }}>
                            <div 
                                className={`role-card ${role === 'alumni' ? 'active' : ''}`}
                                onClick={() => setRole('alumni')}
                                style={{
                                    padding: '12px', border: `1px solid ${role === 'alumni' ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    borderRadius: '16px', background: role === 'alumni' ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease'
                                }}
                            >
                                <GraduationCap size={28} color={role === 'alumni' ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontWeight: '600', fontSize: '13px', color: role === 'alumni' ? 'white' : 'var(--text-muted)' }}>Alumni</div>
                            </div>
                            <div 
                                className={`role-card ${role === 'perusahaan' ? 'active' : ''}`}
                                onClick={() => setRole('perusahaan')}
                                style={{
                                    padding: '12px', border: `1px solid ${role === 'perusahaan' ? 'var(--secondary)' : 'var(--glass-border)'}`,
                                    borderRadius: '16px', background: role === 'perusahaan' ? 'rgba(139, 92, 246, 0.1)' : 'var(--glass-bg)',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease'
                                }}
                            >
                                <Buildings size={28} color={role === 'perusahaan' ? 'var(--secondary)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontWeight: '600', fontSize: '13px', color: role === 'perusahaan' ? 'white' : 'var(--text-muted)' }}>Perusahaan</div>
                            </div>
                            {/* Khusus untuk masa pengembangan (Testing) */}
                            <div 
                                className={`role-card ${role === 'admin' ? 'active' : ''}`}
                                onClick={() => setRole('admin')}
                                style={{
                                    padding: '12px', border: `1px solid ${role === 'admin' ? '#ef4444' : 'var(--glass-border)'}`,
                                    borderRadius: '16px', background: role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'var(--glass-bg)',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease'
                                }}
                            >
                                <WarningCircle size={28} color={role === 'admin' ? '#ef4444' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontWeight: '600', fontSize: '13px', color: role === 'admin' ? 'white' : 'var(--text-muted)' }}>Admin (Test)</div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nama Lengkap / Perusahaan</label>
                            <div className="search-box">
                                <IdentificationCard weight="bold" />
                                <input 
                                    type="text" 
                                    placeholder="Masukkan nama..." 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '20px' }}>
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
                                    placeholder="Buat password yang kuat" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '30px', padding: '16px', justifyContent: 'center' }}>
                            {loading ? "Memproses..." : <><UserPlus weight="bold" size={20} /> Daftar Sekarang</>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Masuk di sini</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
