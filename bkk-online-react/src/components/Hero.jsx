import { ArrowRight, Student, Buildings, Briefcase, Handshake } from "@phosphor-icons/react";

export default function Hero() {
    return (
        <section className="hero">
            <div className="container hero-grid">
                <div className="hero-content">
                    <h2>Masa Depan Karirmu Dimulai <span>Dari Sini</span></h2>
                    <p>
                        Platform cerdas untuk menghubungkan alumni unggulan dengan perusahaan impian secara cepat dan transparan.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => document.querySelector('.jobs-section')?.scrollIntoView({ behavior: 'smooth' })}>
                            Lihat Lowongan <ArrowRight weight="bold" />
                        </button>
                        <button className="btn btn-light" onClick={() => document.querySelector('.footer')?.scrollIntoView({ behavior: 'smooth' })}>
                            Tentang Kami
                        </button>
                    </div>
                </div>

                <div className="stats-box">
                    <div className="stat-card">
                        <Student className="stat-icon" />
                        <h3>1,248</h3>
                        <p>Alumni Aktif</p>
                    </div>
                    <div className="stat-card">
                        <Buildings className="stat-icon" />
                        <h3>86</h3>
                        <p>Perusahaan</p>
                    </div>
                    <div className="stat-card">
                        <Briefcase className="stat-icon" />
                        <h3>142</h3>
                        <p>Lowongan</p>
                    </div>
                    <div className="stat-card">
                        <Handshake className="stat-icon" />
                        <h3>934</h3>
                        <p>Diterima Kerja</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
