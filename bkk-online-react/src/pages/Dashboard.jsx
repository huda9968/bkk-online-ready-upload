import { useAuth } from "../context/AuthContext";
import { Users, Briefcase, Handshake, PenNib, FileText, Buildings, CircleNotch, CaretLeft, Trash, WhatsappLogo, DownloadSimple } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import imageCompression from "browser-image-compression";
import * as XLSX from "xlsx";

export default function Dashboard() {
    const { user } = useAuth();
    
    // Default fallback jika role tidak ada
    const role = user?.user_metadata?.role || "alumni";
    const name = user?.user_metadata?.full_name || user?.email || "Pengguna";

    const [activeTab, setActiveTab] = useState('overview');
    
    // Form state untuk perusahaan
    const [jobForm, setJobForm] = useState({ position: '', location: '', type: 'Full-Time', salary: '', expires_at: '', requirements: '' });
    const [submitting, setSubmitting] = useState(false);

    // Form state untuk admin buat lowongan titipan
    const [adminJobForm, setAdminJobForm] = useState({ company_name: '', position: '', location: '', type: 'Full-Time', salary: '', expires_at: '', requirements: '' });

    // Data lamaran & profil untuk alumni
    const [myApplications, setMyApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [alumniProfileForm, setAlumniProfileForm] = useState({ bio: '', jurusan: '', no_hp: '', cvFile: null, cvUrl: null, photoFile: null, photoUrl: null });
    const [uploading, setUploading] = useState(false);

    // Data pelamar untuk perusahaan
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    // Data untuk Admin
    const [allUsers, setAllUsers] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    // Fungsi: Perusahaan Buat Lowongan
    const handleCreateJob = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase.from('jobs').insert([{
                company_id: user.id,
                company_name: name,
                logo_text: name.charAt(0).toUpperCase(),
                position: jobForm.position,
                location: jobForm.location,
                type: jobForm.type,
                salary: jobForm.salary,
                expires_at: jobForm.expires_at || null,
                requirements: jobForm.requirements
            }]);
            
            if (error) throw error;
            
            alert("Lowongan pekerjaan berhasil dibuat!");
            setJobForm({ position: '', location: '', type: 'Full-Time', salary: '', expires_at: '', requirements: '' });
            setActiveTab('overview');
        } catch (error) {
            alert("Gagal membuat lowongan: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Fungsi: Admin Buat Lowongan Titipan
    const handleAdminCreateJob = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase.from('jobs').insert([{
                company_id: user.id, // Disimpan atas nama ID Admin
                company_name: adminJobForm.company_name,
                logo_text: adminJobForm.company_name.charAt(0).toUpperCase(),
                position: adminJobForm.position,
                location: adminJobForm.location,
                type: adminJobForm.type,
                salary: adminJobForm.salary,
                expires_at: adminJobForm.expires_at || null,
                requirements: adminJobForm.requirements
            }]);
            
            if (error) throw error;
            
            alert("Lowongan titipan berhasil dipublikasikan!");
            setAdminJobForm({ company_name: '', position: '', location: '', type: 'Full-Time', salary: '', expires_at: '', requirements: '' });
            setActiveTab('overview');
        } catch (error) {
            alert("Gagal membuat lowongan: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus lowongan ini?")) return;
        try {
            const { error } = await supabase.from('jobs').delete().eq('id', id);
            if (error) throw error;
            alert("Lowongan berhasil dihapus.");
            if (role === 'admin') fetchAllJobs();
            else fetchCompanyJobs();
        } catch (error) {
            alert("Gagal menghapus lowongan: " + error.message);
        }
    };

    // Fungsi: Perpanjang Masa Aktif Lowongan
    const handleExtendJob = async (id) => {
        const newDateStr = window.prompt("Masukkan tanggal batas waktu yang baru (Format: YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
        if (!newDateStr) return;
        
        try {
            const { error } = await supabase.from('jobs').update({ expires_at: newDateStr }).eq('id', id);
            if (error) throw error;
            alert("Masa aktif lowongan berhasil diperpanjang!");
            if (role === 'admin') fetchAllJobs();
            else fetchCompanyJobs();
        } catch (error) {
            alert("Gagal memperpanjang lowongan: " + error.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("YAKIN INGIN MENGHAPUS PENGGUNA INI? Tindakan ini akan menghapus semua data profil terkait (termasuk lamaran dan lowongan yang dibuatnya). Data tidak dapat dikembalikan!")) return;
        
        try {
            const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId });
            if (error) throw error;
            
            fetchAllUsers();
            alert("Pengguna dan seluruh datanya berhasil dihapus permanen dari sistem.");
        } catch (error) {
            alert("Gagal menghapus pengguna: " + error.message);
            console.error("Delete user error:", error);
        }
    };

    // Fetchers
    const fetchMyApplications = async () => {
        setLoadingApps(true);
        try {
            const { data, error } = await supabase.from('applications').select('*, jobs(*)').eq('applicant_id', user.id).order('created_at', { ascending: false });
            if (!error) setMyApplications(data || []);
        } catch (error) { console.error(error); } 
        finally { setLoadingApps(false); }
    };

    const fetchAllUsers = async () => {
        setLoadingAdmin(true);
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('role');
            if (!error) setAllUsers(data || []);
        } catch (error) { console.error(error); } 
        finally { setLoadingAdmin(false); }
    };

    const fetchAllJobs = async () => {
        setLoadingAdmin(true);
        try {
            const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
            if (!error) setAllJobs(data || []);
        } catch (error) { console.error(error); } 
        finally { setLoadingAdmin(false); }
    };

    const fetchCompanyJobs = async () => {
        setLoadingAdmin(true);
        try {
            const { data, error } = await supabase.from('jobs').select('*').eq('company_id', user.id).order('created_at', { ascending: false });
            if (!error) setAllJobs(data || []);
        } catch (error) { console.error(error); } 
        finally { setLoadingAdmin(false); }
    };

    const fetchAlumniProfile = async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) setAlumniProfileForm({ bio: data.bio || '', jurusan: data.jurusan || '', no_hp: data.no_hp || '', cvFile: null, cvUrl: data.cv_url, photoFile: null, photoUrl: data.photo_url });
        } catch (error) { console.error(error); }
    };

    const fetchCandidates = async () => {
        setLoadingCandidates(true);
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    id,
                    status,
                    created_at,
                    jobs!inner(position, company_id),
                    profiles(full_name, bio, jurusan, cv_url, photo_url, no_hp)
                `)
                .eq('jobs.company_id', user.id)
                .order('created_at', { ascending: false });
            if (!error) setCandidates(data || []);
        } catch (error) { console.error(error); }
        finally { setLoadingCandidates(false); }
    };

    const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
        if (!window.confirm(`Yakin ingin mengubah status menjadi ${newStatus.toUpperCase()}?`)) return;
        
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', applicationId);
                
            if (error) throw error;
            
            // Refresh daftar kandidat
            fetchCandidates();
            alert(`Status berhasil diubah menjadi ${newStatus.toUpperCase()}`);
        } catch (error) {
            alert("Gagal mengubah status: " + error.message);
        }
    };

    const handleExportExcel = () => {
        if (candidates.length === 0) {
            alert("Belum ada data kandidat untuk diekspor.");
            return;
        }

        const exportData = candidates.map((c, i) => ({
            "No": i + 1,
            "Nama Pelamar": c.profiles?.full_name || "Tanpa Nama",
            "Posisi Dilamar": c.jobs?.position || "Tidak Diketahui",
            "Jurusan": c.profiles?.jurusan || "-",
            "No WhatsApp": c.profiles?.no_hp || "-",
            "Status": c.status.toUpperCase(),
            "Tanggal Melamar": new Date(c.created_at).toLocaleDateString('id-ID'),
            "Link CV": c.profiles?.cv_url || "Belum Unggah"
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kandidat");
        XLSX.writeFile(workbook, `Data_Pelamar_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let cv_url = null;
            let photo_url = null;

            // Upload CV
            if (alumniProfileForm.cvFile) {
                const file = alumniProfileForm.cvFile;
                const fileExt = file.name.split('.').pop();
                const fileName = `cv_${user.id}_${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage.from('berkas_alumni').upload(fileName, file);
                if (uploadError) throw uploadError;
                cv_url = supabase.storage.from('berkas_alumni').getPublicUrl(fileName).data.publicUrl;
            }

            // Upload Foto dengan Kompresi
            if (alumniProfileForm.photoFile) {
                let file = alumniProfileForm.photoFile;
                
                // Kompresi jika ukuran > 500KB
                if (file.size > 500 * 1024) {
                    try {
                        const options = {
                            maxSizeMB: 0.5, // Maksimal 500KB
                            maxWidthOrHeight: 1920,
                            useWebWorker: true
                        };
                        file = await imageCompression(file, options);
                    } catch (error) {
                        console.error("Gagal mengkompres foto:", error);
                    }
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `photo_${user.id}_${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage.from('berkas_alumni').upload(fileName, file);
                if (uploadError) throw uploadError;
                photo_url = supabase.storage.from('berkas_alumni').getPublicUrl(fileName).data.publicUrl;
            }

            const updateData = {
                bio: alumniProfileForm.bio,
                jurusan: alumniProfileForm.jurusan,
                no_hp: alumniProfileForm.no_hp,
                updated_at: new Date()
            };

            if (cv_url) updateData.cv_url = cv_url;
            if (photo_url) updateData.photo_url = photo_url;

            const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);
            if (error) throw error;
            
            alert("Profil dan berkas berhasil diperbarui!");
            setActiveTab('overview');
        } catch (error) {
            alert("Gagal memperbarui profil: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'my-applications') fetchMyApplications();
        if (activeTab === 'admin-users') fetchAllUsers();
        if (activeTab === 'admin-jobs') fetchAllJobs();
        if (activeTab === 'company-jobs') fetchCompanyJobs();
        if (activeTab === 'alumni-profile') fetchAlumniProfile();
        if (activeTab === 'company-candidates') fetchCandidates();
    }, [activeTab]);

    return (
        <section className="jobs-section" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <div className="container">
                <div className="section-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="section-title">
                        <h2>Dashboard {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
                        <p>Selamat datang kembali, <strong>{name}</strong>!</p>
                    </div>
                    {activeTab !== 'overview' && (
                        <button className="btn btn-light" onClick={() => setActiveTab('overview')} style={{ padding: '8px 16px' }}>
                            <CaretLeft weight="bold" /> Kembali
                        </button>
                    )}
                </div>

                {activeTab === 'overview' && (
                    <>
                        {/* Tampilan Khusus Admin */}
                        {role === 'admin' && (
                            <div className="stats-box" style={{ marginBottom: '40px' }}>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admin-users')}>
                                    <Users size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Kelola Pengguna</h3>
                                    <p>Lihat daftar akun Perusahaan & Alumni</p>
                                </div>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admin-jobs')}>
                                    <Briefcase size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Pantau Lowongan</h3>
                                    <p>Hapus/Moderasi postingan pekerjaan</p>
                                </div>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admin-create-job')}>
                                    <PenNib size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Buat Lowongan</h3>
                                    <p>Posting pekerjaan titipan dari perusahaan</p>
                                </div>
                            </div>
                        )}

                        {/* Tampilan Khusus Perusahaan */}
                        {role === 'perusahaan' && (
                            <div className="stats-box" style={{ marginBottom: '40px' }}>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('create-job')}>
                                    <PenNib size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Buat Lowongan</h3>
                                    <p>Posting pekerjaan baru untuk alumni</p>
                                </div>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('company-jobs')}>
                                    <Buildings size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Lowongan Saya</h3>
                                    <p>Kelola lowongan yang Anda posting</p>
                                </div>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('company-candidates')}>
                                    <Handshake size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Kandidat Pelamar</h3>
                                    <p>Lihat profil alumni yang melamar</p>
                                </div>
                            </div>
                        )}

                        {/* Tampilan Khusus Alumni */}
                        {role === 'alumni' && (
                            <div className="stats-box" style={{ marginBottom: '40px' }}>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('my-applications')}>
                                    <FileText size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Lamaran Saya</h3>
                                    <p>Cek status pekerjaan yang Anda lamar</p>
                                </div>
                                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('alumni-profile')}>
                                    <Users size={32} className="stat-icon" />
                                    <h3 style={{ fontSize: '24px' }}>Lengkapi Profil</h3>
                                    <p>Unggah CV dan biodata Anda</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Bagian Konten Tambahan */}
                        <div className="job-card" style={{ animation: 'none', transform: 'none' }}>
                            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '15px' }}>
                                Aktivitas Terbaru
                            </h3>
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                                <Buildings size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Belum ada aktivitas yang direkam hari ini.</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Form Buat Lowongan (Perusahaan) */}
                {activeTab === 'create-job' && role === 'perusahaan' && (
                    <div className="job-card" style={{ animation: 'none', transform: 'none', maxWidth: '600px', margin: '0 auto' }}>
                        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            Buat Lowongan Pekerjaan Baru
                        </h3>
                        <form onSubmit={handleCreateJob}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Posisi / Jabatan</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: Staff Administrasi" value={jobForm.position} onChange={e => setJobForm({...jobForm, position: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Lokasi Penempatan</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: Surabaya, Jawa Timur" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Tipe Pekerjaan</label>
                                <select className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Kontrak">Kontrak</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Magang">Magang</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Gaji (Perkiraan)</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: Rp 4.500.000 - Rp 6.000.000" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Persyaratan Pelamar</label>
                                <textarea className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', minHeight: '100px', resize: 'vertical' }} 
                                    required placeholder="Contoh: 
- Laki-laki / Perempuan
- Pendidikan min. SMK/SMA
- Mampu bekerja dalam tim" value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label className="form-label">Batas Waktu Lamaran (Deadline)</label>
                                <input type="date" className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required value={jobForm.expires_at} onChange={e => setJobForm({...jobForm, expires_at: e.target.value})} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                                {submitting ? <><CircleNotch size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</> : "Publikasikan Lowongan"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Daftar Lamaran (Alumni) */}
                {activeTab === 'my-applications' && role === 'alumni' && (
                    <div className="job-card" style={{ animation: 'none', transform: 'none' }}>
                        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            Riwayat Lamaran Saya
                        </h3>
                        
                        {loadingApps ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <CircleNotch size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: '10px' }} />
                                <p style={{ color: 'var(--text-muted)' }}>Memuat data lamaran...</p>
                            </div>
                        ) : myApplications.length > 0 ? (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {myApplications.map((app) => (
                                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>{app.jobs?.position}</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{app.jobs?.company_name} • {app.jobs?.location}</p>
                                        </div>
                                        <div>
                                            <span style={{ 
                                                padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                                background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 
                                                           app.status === 'wawancara' ? 'rgba(34, 197, 94, 0.2)' : 
                                                           'rgba(239, 68, 68, 0.2)',
                                                color: app.status === 'pending' ? '#eab308' : 
                                                       app.status === 'wawancara' ? '#22c55e' : 
                                                       '#ef4444'
                                            }}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <FileText size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Anda belum melamar pekerjaan apapun.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Admin - Kelola Pengguna */}
                {activeTab === 'admin-users' && role === 'admin' && (
                    <div className="job-card" style={{ animation: 'none', transform: 'none' }}>
                        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            Kelola Pengguna
                        </h3>
                        {loadingAdmin ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <CircleNotch size={30} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {allUsers.map((u) => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                                        <div>
                                            <strong>{u.full_name}</strong>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                                                {u.role}
                                            </div>
                                            {u.id !== user.id && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center', fontSize: '12px' }}>
                                                    <Trash weight="bold" /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Admin/Company - Pantau Lowongan */}
                {(activeTab === 'admin-jobs' || activeTab === 'company-jobs') && (
                    <div className="job-card" style={{ animation: 'none', transform: 'none' }}>
                        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            {activeTab === 'admin-jobs' ? 'Pantau Lowongan Pekerjaan' : 'Kelola Lowongan Saya'}
                        </h3>
                        {loadingAdmin ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <CircleNotch size={30} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                            </div>
                        ) : allJobs.length > 0 ? (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {allJobs.map((j) => {
                                    const isExpired = j.expires_at && new Date(j.expires_at) < new Date();
                                    return (
                                        <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{j.position}</div>
                                                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '5px' }}>{j.company_name}</div>
                                                <div style={{ fontSize: '12px', color: isExpired ? '#ef4444' : 'var(--text-muted)' }}>
                                                    Batas Waktu: <strong>{j.expires_at ? new Date(j.expires_at).toLocaleDateString('id-ID') : 'Tidak ditentukan'}</strong>
                                                    {isExpired && <span style={{ marginLeft: '8px', background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '12px' }}>DITUTUP</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => handleExtendJob(j.id)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                    Perpanjang
                                                </button>
                                                <button onClick={() => handleDeleteJob(j.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                    <Trash weight="bold" /> Hapus
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <Briefcase size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Belum ada lowongan.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Admin - Buat Lowongan Titipan */}
                {activeTab === 'admin-create-job' && role === 'admin' && (
                    <div className="job-card" style={{ animation: 'none', transform: 'none', maxWidth: '600px', margin: '0 auto' }}>
                        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            Buat Lowongan Titipan (Admin)
                        </h3>
                        <form onSubmit={handleAdminCreateJob}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Nama Perusahaan (Klien)</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: PT ABC Indonesia" value={adminJobForm.company_name} onChange={e => setAdminJobForm({...adminJobForm, company_name: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Posisi / Jabatan</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: Staff Administrasi" value={adminJobForm.position} onChange={e => setAdminJobForm({...adminJobForm, position: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Lokasi Penempatan</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: Surabaya, Jawa Timur" value={adminJobForm.location} onChange={e => setAdminJobForm({...adminJobForm, location: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Tipe Pekerjaan</label>
                                <select className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    value={adminJobForm.type} onChange={e => setAdminJobForm({...adminJobForm, type: e.target.value})}>
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Kontrak">Kontrak</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Magang">Magang</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Gaji (Perkiraan)</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: Rp 4.500.000 - Rp 6.000.000" value={adminJobForm.salary} onChange={e => setAdminJobForm({...adminJobForm, salary: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Persyaratan Pelamar</label>
                                <textarea className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', minHeight: '100px', resize: 'vertical' }} 
                                    required placeholder="Contoh: 
- Laki-laki / Perempuan
- Pendidikan min. SMK/SMA
- Mampu bekerja dalam tim" value={adminJobForm.requirements} onChange={e => setAdminJobForm({...adminJobForm, requirements: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label className="form-label">Batas Waktu Lamaran (Deadline)</label>
                                <input type="date" className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required value={adminJobForm.expires_at} onChange={e => setAdminJobForm({...adminJobForm, expires_at: e.target.value})} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                                {submitting ? <><CircleNotch size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</> : "Publikasikan Lowongan Titipan"}
                            </button>
                        </form>
                    </div>
                )}
                {/* Form Lengkapi Profil (Alumni) */}
                {activeTab === 'alumni-profile' && role === 'alumni' && (
                    <div className="job-card" style={{ animation: 'none', transform: 'none', maxWidth: '600px', margin: '0 auto' }}>
                        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            Lengkapi Profil & Unggah CV
                        </h3>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Jurusan</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: Rekayasa Perangkat Lunak" value={alumniProfileForm.jurusan} onChange={e => setAlumniProfileForm({...alumniProfileForm, jurusan: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Nomor WhatsApp (Aktif)</label>
                                <input className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                    required placeholder="Contoh: 08123456789" value={alumniProfileForm.no_hp} onChange={e => setAlumniProfileForm({...alumniProfileForm, no_hp: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Tentang Saya (Bio Pendek)</label>
                                <textarea className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', minHeight: '100px' }} 
                                    placeholder="Ceritakan sedikit tentang keahlian Anda..." value={alumniProfileForm.bio} onChange={e => setAlumniProfileForm({...alumniProfileForm, bio: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label className="form-label">Unggah Pas Foto (JPG/PNG)</label>
                                    {alumniProfileForm.photoUrl && (
                                        <div style={{ marginBottom: '10px' }}>
                                            <img src={alumniProfileForm.photoUrl} alt="Foto Profil" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                        onChange={e => setAlumniProfileForm({...alumniProfileForm, photoFile: e.target.files[0]})} />
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Biarkan kosong jika tidak ingin mengubah foto.</p>
                                </div>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label className="form-label">Unggah CV (PDF)</label>
                                    {alumniProfileForm.cvUrl && (
                                        <div style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--primary)', height: '80px', display: 'flex', alignItems: 'flex-end' }}>
                                            <a href={alumniProfileForm.cvUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>[Lihat CV Saat Ini]</a>
                                        </div>
                                    )}
                                    <input type="file" accept=".pdf" className="search-box" style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }} 
                                        onChange={e => setAlumniProfileForm({...alumniProfileForm, cvFile: e.target.files[0]})} />
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Biarkan kosong jika tidak ingin mengubah CV.</p>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={uploading}>
                                {uploading ? <><CircleNotch size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : "Simpan Profil"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Kandidat Pelamar (Perusahaan) */}
                {activeTab === 'company-candidates' && role === 'perusahaan' && (
                    <div className="job-card" style={{ animation: 'none', transform: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Daftar Kandidat Pelamar</h3>
                            <button 
                                onClick={handleExportExcel}
                                style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 'bold' }}>
                                <DownloadSimple weight="bold" /> Ekspor ke Excel
                            </button>
                        </div>
                        {loadingCandidates ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <CircleNotch size={30} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                            </div>
                        ) : candidates.length > 0 ? (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {candidates.map((c) => (
                                    <div key={c.id} style={{ padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', gap: '20px' }}>
                                        {/* Foto Profil */}
                                        <div style={{ flexShrink: 0 }}>
                                            {c.profiles?.photo_url ? (
                                                <img src={c.profiles.photo_url} alt="Foto Profil" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)' }} />
                                            ) : (
                                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--glass-border)' }}>
                                                    <Users size={40} style={{ opacity: 0.5 }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Data Diri */}
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <h4 style={{ margin: 0, fontSize: '20px' }}>{c.profiles?.full_name}</h4>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
                                                    Melamar: <strong>{c.jobs?.position}</strong>
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--primary)' }}>Jurusan: {c.profiles?.jurusan || 'Belum diisi'}</p>
                                            {c.profiles?.no_hp && (
                                                <p style={{ margin: '0 0 10px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    WhatsApp: 
                                                    <a 
                                                        href={`https://wa.me/${c.profiles.no_hp.replace(/^0/, '62')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 'bold', textDecoration: 'underline' }}>
                                                        <WhatsappLogo weight="fill" size={18} /> {c.profiles.no_hp} (Hubungi)
                                                    </a>
                                                </p>
                                            )}
                                            <p style={{ margin: '0 0 15px 0', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.5' }}>"{c.profiles?.bio || 'Tidak ada deskripsi.'}"</p>
                                            
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {c.profiles?.cv_url ? (
                                                    <a href={c.profiles.cv_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', fontSize: '14px' }}>
                                                        <FileText weight="bold" /> Lihat Berkas CV
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: '14px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                                                        Pelamar belum mengunggah CV.
                                                    </span>
                                                )}

                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    {c.status === 'pending' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleUpdateApplicationStatus(c.id, 'ditolak')}
                                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                                Tolak
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateApplicationStatus(c.id, 'wawancara')}
                                                                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                                Panggil Wawancara
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{ 
                                                            padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', border: '1px solid',
                                                            background: c.status === 'wawancara' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: c.status === 'wawancara' ? '#22c55e' : '#ef4444',
                                                            borderColor: c.status === 'wawancara' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
                                                        }}>
                                                            Keputusan: {c.status.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <Users size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Belum ada pelamar untuk lowongan Anda.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
