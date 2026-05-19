import { MagnifyingGlass, CircleNotch } from "@phosphor-icons/react";
import JobCard from "../components/JobCard";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50); // Mencegah loading terlalu berat jika lowongan sudah ribuan
                
                if (error) throw error;
                setJobs(data || []);
            } catch (error) {
                console.error("Error fetching jobs:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = jobTypeFilter ? job.type === jobTypeFilter : true;
        
        return matchesSearch && matchesType;
    });

    return (
        <section className="jobs-section">
            <div className="container">
                <div className="section-header">
                    <div className="section-title">
                        <h2>Lowongan Terbaru</h2>
                        <p>Temukan pekerjaan yang sesuai dengan keahlianmu</p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div className="search-box" style={{ flex: 1, minWidth: '200px' }}>
                            <MagnifyingGlass weight="bold" />
                            <input 
                                type="text" 
                                placeholder="Cari posisi, perusahaan, atau lokasi..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="search-box" 
                            style={{ padding: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', minWidth: '150px' }}
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                        >
                            <option value="">Semua Tipe Pekerjaan</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Kontrak">Kontrak</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Magang">Magang</option>
                        </select>
                    </div>
                </div>

                <div className="jobs-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--primary)' }}>
                            <CircleNotch size={48} className="spin-animation" style={{ marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Memuat lowongan...</p>
                            <style>{`
                                @keyframes spin { 100% { transform: rotate(360deg); } }
                            `}</style>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => (
                            <JobCard key={job.id} job={job} index={index} />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <MagnifyingGlass size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Belum ada lowongan yang tersedia saat ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
