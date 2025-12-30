import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Mail, Lock, UserPlus } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/register", { email, password });
      toast.success("Registered successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Registration failed");
    }
  };

  const outerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
    background: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.25), transparent 35%), radial-gradient(circle at 80% 0%, rgba(124,58,237,0.25), transparent 35%), linear-gradient(135deg, #0f172a, #0b1120)",
  };

  const gridOverlay = {
    position: "absolute",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    opacity: 0.6,
    pointerEvents: "none",
  };

  const glow = {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.22), transparent 55%)",
    filter: "blur(20px)",
    top: "-80px",
    right: "-60px",
    pointerEvents: "none",
  };

  const vaultStyle = {
    position: "absolute",
    left: "50%",
    top: "25%",
    transform: "translate(-50%, -50%)",
    width: "560px",
    height: "560px",
    opacity: 0.35,
    filter: "drop-shadow(0 0 12px rgba(124,58,237,0.25))",
    pointerEvents: "none",
    zIndex: 0,
  };

  const cardStyle = {
    position: "relative",
    zIndex: 1,
    background: "rgba(17, 24, 39, 0.78)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    padding: "2.25rem",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "420px",
    color: "#e5e7eb",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    color: "#cbd5e1",
    marginBottom: "0.35rem",
  };

  const inputWrap = {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    width: "100%",
    padding: "0.65rem 0.75rem",
    marginBottom: "1rem",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(255,255,255,0.02)",
  };

  const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#e5e7eb",
    outline: "none",
    fontSize: "1rem",
  };

  const buttonStyle = {
    width: "100%",
    background: "linear-gradient(90deg, #2563eb, #7c3aed)",
    color: "#fff",
    padding: "0.85rem",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    letterSpacing: "0.2px",
    marginTop: "0.25rem",
    boxShadow: "0 14px 35px rgba(37,99,235,0.35)",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  };

  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.15)",
    color: "#bfdbfe",
    fontSize: "0.85rem",
    border: "1px solid rgba(59,130,246,0.35)",
    marginBottom: "0.75rem",
  };

  return (
    <div style={outerStyle}>
      <div style={gridOverlay} />
      <motion.svg
        style={vaultStyle}
        viewBox="0 0 100 100"
        initial={{ rotate: 0, scale: 1 }}
        animate={{ rotate: 360, scale: [1, 1.03, 1] }}
        transition={{ rotate: { repeat: Infinity, duration: 60, ease: "linear" }, scale: { repeat: Infinity, duration: 14, ease: "easeInOut" } }}
      >
        <defs>
          <linearGradient id="ringGradReg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" stroke="url(#ringGradReg)" strokeWidth="0.6" fill="none" />
        <circle cx="50" cy="50" r="40" stroke="url(#ringGradReg)" strokeWidth="0.6" fill="none" opacity="0.9" />
        <circle cx="50" cy="50" r="32" stroke="url(#ringGradReg)" strokeWidth="0.6" fill="none" opacity="0.7" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 24;
          const r1 = 36;
          const r2 = 46;
          const x1 = 50 + r1 * Math.cos(a);
          const y1 = 50 + r1 * Math.sin(a);
          const x2 = 50 + r2 * Math.cos(a);
          const y2 = 50 + r2 * Math.sin(a);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#ringGradReg)"
              strokeWidth="0.6"
              opacity="0.85"
            />
          );
        })}
        <circle cx="50" cy="50" r="6" fill="rgba(124,58,237,0.35)" stroke="#7c3aed" strokeWidth="0.4" />
      </motion.svg>
      <div style={glow} />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={cardStyle}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <div style={pillStyle}>
              <UserPlus size={16} />
              Create SecureSafe
            </div>
            <h2 style={{ margin: "0.35rem 0 0", fontSize: "1.4rem", color: "#e5e7eb" }}>
              Join the secure cloud
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
              Register to encrypt and access your files anywhere.
            </p>
          </div>
        </div>

        <label style={labelStyle} htmlFor="email">Email</label>
        <div style={inputWrap}>
          <Mail size={18} color="#a5b4fc" />
          <input
            id="email"
            style={inputStyle}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister(e)}
            required
          />
        </div>

        <label style={labelStyle} htmlFor="password">Password</label>
        <div style={inputWrap}>
          <Lock size={18} color="#a5b4fc" />
          <input
            id="password"
            style={inputStyle}
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister(e)}
            required
          />
        </div>

        <button
          type="submit"
          style={buttonStyle}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          onClick={handleRegister}
        >
          Create Account
        </button>

        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.9rem", color: "#cbd5e1" }}>
          Already have an account? {isMobile ? (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: "transparent",
                border: "none",
                color: "#60a5fa",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                fontSize: "inherit",
              }}
            >
              Log in
            </button>
          ) : (
            <Link to="/login" style={{ color: "#60a5fa", fontWeight: 600 }}>Log in</Link>
          )}
        </p>
      </motion.div>
    </div>
  );
}
