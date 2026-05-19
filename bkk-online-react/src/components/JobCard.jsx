import { MapPin, PaperPlaneRight, CircleNotch } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

export default function JobCard({ job, index }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const isExpired = job.expires_at && new Date(job.expires_at) < new Date();

    const handleApply = async () => {
        if (isExpired) {
            alert('Maaf, lowongan ini sudah ditutup.');
            return;
        }

        if (!user) {
            navigate('/login');
            return;
        }
        
        const role = user.user_metadata?.role;
        if (role !== 'alumni') {
            alert('Hanya akun Alumni yang bisa melamar pekerjaan.');
            return;
        }

        setLoading(true);
        try {
            // Cek kelengkapan profil (CV dan Foto wajib ada)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('cv_url, photo_url')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            if (!profile.cv_url || !profile.photo_url) {
                alert('Tunggu dulu! Anda belum melengkapi profil. Anda WAJIB mengunggah Pas Foto dan CV sebelum bisa melamar pekerjaan.');
                navigate('/dashboard'); // Arahkan ke dashboard
                return;
            }

            // Jika profil lengkap, lanjutkan melamar
            const { error } = await supabase
                .from('applications')
                .insert([
                    { job_id: job.id, applicant_id: user.id }
                ]);
            
            if (error) throw error;
            
            alert(`Lamaran untuk posisi ${job.position} berhasil dikirim!`);
        } catch (error) {
            alert('Gagal mengirim lamaran: ' + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="job-card" style={{ animationDelay: `${index * 0.1}s`, opacity: isExpired ? 0.7 : 1 }}>
            <div className="job-header">
                <div className="company-logo">{job.logo_text || job.logoText}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="job-badge">{job.type}</div>
                    {isExpired && <div className="job-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>DITUTUP</div>}
                </div>
            </div>
            <h3>{job.position}</h3>
            <p className="job-company">{job.company_name || job.company}</p>
            
            <div className="job-details">
                <div className="detail-item">
                    <MapPin weight="bold" /> {job.location}
                </div>
                {job.expires_at && (
                    <div className="detail-item" style={{ color: isExpired ? '#ef4444' : 'var(--text-muted)' }}>
                        <CircleNotch weight="bold" /> S/d: {new Date(job.expires_at).toLocaleDateString('id-ID')}
                    </div>
                )}
            </div>

            {job.requirements && (
                <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Kualifikasi / Persyaratan:</h4>
                    <div style={{ fontSize: '13px', color: 'white', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {job.requirements}
                    </div>
                </div>
            )}
            
            <div className="job-salary">{job.salary}</div>

            <button className="apply-btn" onClick={handleApply} disabled={loading || isExpired} style={{ background: isExpired ? 'rgba(255,255,255,0.1)' : '', cursor: isExpired ? 'not-allowed' : 'pointer' }}>
                {loading ? (
                    <><CircleNotch size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
                ) : isExpired ? (
                    "Lowongan Ditutup"
                ) : (
                    <>Lamar Sekarang <PaperPlaneRight weight="bold" style={{ verticalAlign: 'middle', marginLeft: '4px' }} /></>
                )}
            </button>
        </div>
    );
}
