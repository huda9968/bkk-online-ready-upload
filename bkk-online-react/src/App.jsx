import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Home />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
              <h2 style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '10px' }}>404</h2>
              <h3>Halaman Tidak Ditemukan</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
            </div>
          } />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
