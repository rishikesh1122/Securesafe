import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ShieldCheck, Shield, Cloud, Zap, FolderLock, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ text: "", tone: "" });
  const [showForm, setShowForm] = useState('login'); // Default to 'login' so form shows by default
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show login form
      if (!mobile) {
        setShowForm('login');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const login = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      
      // Trigger custom event for auth state change
      window.dispatchEvent(new Event("authChange"));
      
      setStatus({ text: "Login successful. Redirecting to dashboard...", tone: "success" });
      setTimeout(() => navigate("/dashboard"), 400);
    } catch (err) {
      setStatus({ text: "Invalid credentials. Please try again.", tone: "error" });
    }
  };

  const outerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "3rem",
    padding: "2rem 1rem",
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

  const bannerStyle = (tone) => ({
    marginTop: "0.5rem",
    marginBottom: "0.75rem",
    padding: "0.75rem 0.85rem",
    borderRadius: "12px",
    border: tone === "success" ? "1px solid rgba(74,222,128,0.45)" : "1px solid rgba(248,113,113,0.45)",
    background: tone === "success" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
    color: tone === "success" ? "#bbf7d0" : "#fecdd3",
    fontSize: "0.95rem",
  });
const features = [
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description: "AES-256 encryption ensures your files are protected with bank-level security",
      delay: 0.2
    },
    {
      icon: Cloud,
      title: "Secure Cloud Storage",
      description: "Store your encrypted files safely in the cloud with instant access anywhere",
      delay: 0.4
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Upload, encrypt, and access your files in seconds with our optimized platform",
      delay: 0.6
    },
    {
      icon: FolderLock,
      title: "Smart Organization",
      description: "Organize files in folders with notes and metadata for easy management",
      delay: 0.8
    }
  ];

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
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" stroke="url(#ringGrad)" strokeWidth="0.6" fill="none" />
        <circle cx="50" cy="50" r="40" stroke="url(#ringGrad)" strokeWidth="0.6" fill="none" opacity="0.9" />
        <circle cx="50" cy="50" r="32" stroke="url(#ringGrad)" strokeWidth="0.6" fill="none" opacity="0.7" />
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
              stroke="url(#ringGrad)"
              strokeWidth="0.6"
              opacity="0.85"
            />
          );
        })}
        <circle cx="50" cy="50" r="6" fill="rgba(124,58,237,0.35)" stroke="#7c3aed" strokeWidth="0.4" />
      </motion.svg>
      <div style={glow} />

      {/* Description Section with Features */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "relative",
          width: "100%",
          zIndex: 1,
          maxWidth: "480px",
          color: "#e5e7eb",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 style={{
            fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
            fontWeight: 700,
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            SecureSafe Cloud
          </h1>
          <p style={{
            fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
            color: "#cbd5e1",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}>
            Your personal encrypted vault in the cloud. Upload, encrypt, and access your files securely from anywhere in the world.
          </p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
              style={{
                display: "flex",
                gap: "1rem",
                padding: "clamp(0.85rem, 2vw, 1.25rem)",
                borderRadius: "16px",
                background: "rgba(17, 24, 39, 0.6)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                cursor: "pointer",
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: feature.delay,
                }}
                style={{
                  minWidth: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
                  border: "1px solid rgba(124,58,237,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <feature.icon size={24} color="#a78bfa" />
              </motion.div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: 0,
                  marginBottom: "0.35rem",
                  fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                  fontWeight: 600,
                  color: "#e5e7eb",
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: "clamp(0.85rem, 1.8vw, 0.9rem)",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          style={{
            marginTop: "1.5rem",
            padding: "0.85rem",
            borderRadius: "12px",
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.25)",
            textAlign: "center",
          }}
        >
          <p style={{
            margin: 0,
            fontSize: "clamp(0.8rem, 1.8vw, 0.9rem)",
            color: "#bfdbfe",
          }}>
            🔒 Trusted by professionals • Bank-grade security • 100% private and encrypted
          </p>
        </motion.div>

        {/* Mobile Action Buttons - only show on initial landing */}
        {isMobile && showForm === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm('login')}
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                color: "#fff",
                padding: "1rem",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1.05rem",
                letterSpacing: "0.3px",
                boxShadow: "0 14px 35px rgba(37,99,235,0.35)",
              }}
            >
              Login to SecureSafe
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              style={{
                width: "100%",
                background: "rgba(17, 24, 39, 0.8)",
                color: "#e5e7eb",
                padding: "1rem",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1.05rem",
                letterSpacing: "0.3px",
              }}
            >
              Create Account
            </motion.button>
          </motion.div>
        )}
        </motion.div>
      )}

      {/* Login/Register Form */}
      <AnimatePresence>
        {(!isMobile || showForm) && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={cardStyle}
          >
            {isMobile && showForm && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowForm(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "0.5rem 0",
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                }}
              >
                <ArrowLeft size={18} />
                Back
              </motion.button>
            )}

            {/* Login form content */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <div style={pillStyle}>
                    <ShieldCheck size={16} />
                    SecureSafe Cloud
                  </div>
                  <h2 style={{ margin: "0.35rem 0 0", fontSize: "1.4rem", color: "#e5e7eb" }}>
                    Welcome back
                  </h2>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
                    Sign in to protect and access your encrypted files.
                  </p>
                </div>
              </div>

              {status.text && <div style={bannerStyle(status.tone)}>{status.text}</div>}

        <label style={labelStyle} htmlFor="email">Email</label>
        <div style={inputWrap}>
          <Mail size={18} color="#a5b4fc" />
          <input
            id="email"
            style={{
              ...inputStyle,
              caretColor: "#a5b4fc",
              backgroundColor: "transparent",
              WebkitBoxShadow: "0 0 0 1000px transparent inset",
              WebkitTextFillColor: "#e5e7eb",
            }}
            className="auth-input"
            placeholder="you@example.com"
            onFocus={(e) => {
              e.target.style.background = "transparent";
              e.target.style.WebkitBoxShadow = "0 0 0 1000px transparent inset";
              e.target.dataset.placeholder = e.target.placeholder;
              e.target.placeholder = "";
            }}
            onBlur={(e) => {
              e.target.style.background = "transparent";
              e.target.style.WebkitBoxShadow = "0 0 0 1000px transparent inset";
              if (!e.target.value) {
                e.target.placeholder = e.target.dataset.placeholder || "you@example.com";
              }
            }}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>

        <label style={labelStyle} htmlFor="password">Password</label>
        <div style={inputWrap}>
          <Lock size={18} color="#a5b4fc" />
          <input
            id="password"
            style={{
              ...inputStyle,
              caretColor: "#a5b4fc",
              backgroundColor: "transparent",
              WebkitBoxShadow: "0 0 0 1000px transparent inset",
              WebkitTextFillColor: "#e5e7eb",
            }}
            className="auth-input"
            type="password"
            placeholder="Password"
            onFocus={(e) => {
              e.target.style.background = "transparent";
              e.target.style.WebkitBoxShadow = "0 0 0 1000px transparent inset";
              e.target.dataset.placeholder = e.target.placeholder;
              e.target.placeholder = "";
            }}
            onBlur={(e) => {
              e.target.style.background = "transparent";
              e.target.style.WebkitBoxShadow = "0 0 0 1000px transparent inset";
              if (!e.target.value) {
                e.target.placeholder = e.target.dataset.placeholder || "Password";
              }
            }}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>

                <button
                  onClick={login}
                  style={buttonStyle}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  Enter SecureSafe
                </button>

                <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.9rem", color: "#cbd5e1" }}>
                  Don't have an account? {isMobile ? (
                    <button
                      onClick={() => navigate('/register')}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#60a5fa",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Register
                    </button>
                  ) : (
                    <Link to="/register" style={{ color: "#60a5fa", fontWeight: 600 }}>Register</Link>
                  )}
                </p>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
