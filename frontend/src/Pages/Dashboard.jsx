import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldCheck, Upload, LogOut, CloudDownload, Trash2, FileText, RefreshCw, Settings, Activity, LifeBuoy } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const apiRef = useRef(null);
  const fileInputRef = useRef(null);
  const shellRef = useRef(null);
  const uploadRef = useRef(null);
  const filesRef = useRef(null);
  const logoutRef = useRef(null);
  const [hoverUpload, setHoverUpload] = useState(false);
  const [hoverFiles, setHoverFiles] = useState(false);
  const [tiltUpload, setTiltUpload] = useState({ x: 0, y: 0 });
  const [tiltFiles, setTiltFiles] = useState({ x: 0, y: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const setHoverState = (target, isHover, solid = false) => {
    target.style.transform = isHover ? "translateY(-1px) scale(1.01)" : "translateY(0)";
    if (solid) {
      target.style.boxShadow = isHover
        ? "0 16px 40px rgba(37,99,235,0.45)"
        : "0 12px 30px rgba(37,99,235,0.3)";
    } else {
      target.style.boxShadow = isHover ? "0 10px 24px rgba(0,0,0,0.25)" : "";
    }
  };

  const handleMouseEnter = (e, solid = false) => setHoverState(e.currentTarget, true, solid);
  const handleMouseLeave = (e, solid = false) => setHoverState(e.currentTarget, false, solid);
  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = "translateY(1px) scale(0.99)";
  };
  const handleMouseUp = (e, solid = false) => setHoverState(e.currentTarget, true, solid);

  const handleTiltMove = (e, setTilt) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const dx = x - 0.5; // -0.5..0.5
    const dy = y - 0.5; // -0.5..0.5
    setTilt({ x: dx, y: dy });
  };

  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: "http://127.0.0.1:8000",
    });

    apiRef.current.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRef.current.get("/files");
      setFiles(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await apiRef.current.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          }
        },
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchFiles();
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await apiRef.current.get(`/download/${filename}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Download failed");
    }
  };

  const handleDelete = (filename) => {
    setFileToDelete(filename);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await apiRef.current.delete(`/delete/${fileToDelete}`);
      await fetchFiles();
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    } catch (err) {
      setError("Delete failed");
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFileToDelete(null);
  };

  const logout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const outerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    opacity: 0.5,
    pointerEvents: "none",
  };

  const glow = {
    position: "absolute",
    width: "480px",
    height: "480px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 55%)",
    filter: "blur(20px)",
    top: "-120px",
    right: "-80px",
    pointerEvents: "none",
  };

  const vaultStyle = {
    position: "absolute",
    left: "50%",
    top: "30%",
    transform: "translate(-50%, -50%)",
    width: "720px",
    height: "720px",
    opacity: 0.28,
    filter: "drop-shadow(0 0 14px rgba(124,58,237,0.22))",
    pointerEvents: "none",
    zIndex: 0,
  };

  const shellStyle = {
    position: "relative",
    zIndex: 1,
    width: "min(1200px, 100%)",
    color: "#e5e7eb",
  };

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  };

  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.18)",
    border: "1px solid rgba(59,130,246,0.35)",
    color: "#c7d2fe",
    fontWeight: 600,
  };

  const buttonSolid = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.68rem 1.05rem",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(90deg, #2563eb, #7c3aed)",
    color: "#fff",
    fontWeight: 600,
    boxShadow: "0 12px 30px rgba(37,99,235,0.3)",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  };

  const buttonGhost = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.6rem 0.85rem",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(255,255,255,0.04)",
    color: "#e5e7eb",
    cursor: "pointer",
    transition: "transform 120ms ease, border-color 120ms ease",
  };

  const navLinks = [
    { label: "Overview", icon: ShieldCheck, target: "overview" },
    { label: "Uploads", icon: Upload, target: "uploads" },
    { label: "Activity", icon: Activity, target: "activity" },
    { label: "Support", icon: LifeBuoy, target: "support" },
    { label: "Settings", icon: Settings, target: "settings" },
  ];

  const handleNavClick = (target) => {
    const map = {
      overview: shellRef,
      uploads: uploadRef,
      activity: filesRef,
      support: filesRef,
      settings: logoutRef,
    };
    const ref = map[target];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cardStyle = {
    position: "relative",
    background: "rgba(17,24,39,0.8)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "18px",
    padding: "1.3rem",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
    overflow: "hidden",
  };

  const dropzoneStyle = {
    position: "relative",
    border: dragActive ? "1px dashed rgba(124,58,237,0.7)" : "1px dashed rgba(148,163,184,0.35)",
    borderRadius: "14px",
    background:
      dragActive
        ? "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(37,99,235,0.12))"
        : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    const val = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${val} ${sizes[i]}`;
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    color: "#cbd5e1",
    marginBottom: "0.35rem",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0.75rem",
  };

  const thStyle = {
    textAlign: "left",
    padding: "0.85rem",
    color: "#cbd5e1",
    borderBottom: "1px solid rgba(148,163,184,0.2)",
    fontSize: "0.95rem",
  };

  const tdStyle = {
    padding: "0.85rem",
    color: "#e5e7eb",
    borderBottom: "1px solid rgba(148,163,184,0.15)",
    fontSize: "0.95rem",
  };

  return (
    <div style={outerStyle}>
      <div style={gridOverlay} />
      <motion.svg
        style={vaultStyle}
        viewBox="0 0 100 100"
        initial={{ rotate: 0, scale: 1 }}
        animate={{ rotate: 360, scale: [1, 1.02, 1] }}
        transition={{ rotate: { repeat: Infinity, duration: 80, ease: "linear" }, scale: { repeat: Infinity, duration: 16, ease: "easeInOut" } }}
      >
        <defs>
          <linearGradient id="ringGradDash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" stroke="url(#ringGradDash)" strokeWidth="0.6" fill="none" />
        <circle cx="50" cy="50" r="40" stroke="url(#ringGradDash)" strokeWidth="0.6" fill="none" opacity="0.9" />
        <circle cx="50" cy="50" r="32" stroke="url(#ringGradDash)" strokeWidth="0.6" fill="none" opacity="0.7" />
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
              stroke="url(#ringGradDash)"
              strokeWidth="0.6"
              opacity="0.85"
            />
          );
        })}
        <circle cx="50" cy="50" r="6" fill="rgba(124,58,237,0.3)" stroke="#7c3aed" strokeWidth="0.4" />
      </motion.svg>
      <div style={glow} />
      <div style={shellStyle} ref={shellRef}>
        <div style={navStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={pillStyle}>
              <ShieldCheck size={17} />
              SecureSafe Vault
            </div>
            <span style={{ color: "#94a3b8" }}>{files.length} files encrypted</span>
          </div>
          <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
            <button
              style={buttonGhost}
              onClick={fetchFiles}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {navLinks.map((item) => (
            <button
              key={item.label}
              style={buttonGhost}
              onClick={() => handleNavClick(item.target)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.9rem 1rem",
              borderRadius: "12px",
              border: "1px solid rgba(248,113,113,0.45)",
              background: "rgba(248,113,113,0.1)",
              color: "#fecdd3",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              ...cardStyle,
              boxShadow: hoverUpload
                ? "0 24px 70px rgba(37,99,235,0.4)"
                : "0 24px 60px rgba(0,0,0,0.35)",
              willChange: "transform",
              transform:
                hoverUpload
                  ? `rotateX(${(-tiltUpload.y * 8).toFixed(2)}deg) rotateY(${(tiltUpload.x * 10).toFixed(2)}deg)`
                  : "none",
              transition: "transform 160ms ease-out",
            }}
            ref={uploadRef}
            onMouseEnter={() => setHoverUpload(true)}
            onMouseLeave={() => setHoverUpload(false)}
            onMouseMove={(e) => handleTiltMove(e, setTiltUpload)}
          >
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: "-20% -10% -20% -10%",
                background:
                  "radial-gradient(circle at 20% 30%, rgba(37,99,235,0.22), transparent 55%), radial-gradient(circle at 80% 60%, rgba(124,58,237,0.12), transparent 55%)",
                filter: "blur(24px)",
                zIndex: 0,
                pointerEvents: "none",
              }}
              initial={{ x: -8, y: -6, opacity: 0.9 }}
              animate={{ x: [ -8, 8, -8 ], y: [ -6, 6, -6 ], opacity: [0.9, 0.95, 0.9] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(closest-side, rgba(37,99,235,0.22), transparent 60%)",
                zIndex: 0,
                pointerEvents: "none",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hoverUpload ? 0.35 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <Upload size={18} color="#a5b4fc" />
                <div>
                  <div style={{ color: "#e5e7eb", fontWeight: 700 }}>Upload</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Encrypt and store a new file</div>
                </div>
              </div>
            </div>
            <form onSubmit={handleUpload} style={{ position: "relative", zIndex: 1 }}>
              <label style={labelStyle} htmlFor="file">Select file</label>
              <div
                style={dropzoneStyle}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) setSelectedFile(f);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                  <Upload size={18} color="#a5b4fc" />
                  <div style={{ color: "#e5e7eb" }}>
                    {selectedFile ? (
                      <>
                        <div style={{ fontWeight: 700 }}>{selectedFile.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{formatBytes(selectedFile.size)}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700 }}>Drop your file here</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>or click to browse</div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  style={{ ...buttonGhost }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse
                </button>
              </div>

              <input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={uploading}
                style={{ display: "none" }}
              />

              {uploadProgress > 0 && (
                <div style={{ marginTop: "0.6rem", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                      boxShadow: "0 6px 18px rgba(124,58,237,0.35)",
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                style={{ ...buttonSolid, width: "100%", marginTop: "0.9rem" }}
                disabled={uploading}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                {uploading ? "Uploading..." : "Upload securely"}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            style={{
              ...cardStyle,
              gridColumn: "1 / -1",
              minWidth: 0,
              boxShadow: hoverFiles
                ? "0 24px 70px rgba(124,58,237,0.4)"
                : "0 24px 60px rgba(0,0,0,0.35)",
              willChange: "transform",
              transform:
                hoverFiles
                  ? `rotateX(${(-tiltFiles.y * 8).toFixed(2)}deg) rotateY(${(tiltFiles.x * 10).toFixed(2)}deg)`
                  : "none",
              transition: "transform 160ms ease-out",
            }}
            ref={filesRef}
            onMouseEnter={() => setHoverFiles(true)}
            onMouseLeave={() => setHoverFiles(false)}
            onMouseMove={(e) => handleTiltMove(e, setTiltFiles)}
          >
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: "-20% -10% -20% -10%",
                background:
                  "radial-gradient(circle at 25% 35%, rgba(124,58,237,0.22), transparent 55%), radial-gradient(circle at 75% 65%, rgba(37,99,235,0.12), transparent 55%)",
                filter: "blur(24px)",
                zIndex: 0,
                pointerEvents: "none",
              }}
              initial={{ x: 10, y: -8, opacity: 0.9 }}
              animate={{ x: [ 10, -10, 10 ], y: [ -8, 8, -8 ], opacity: [0.9, 0.95, 0.9] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(closest-side, rgba(124,58,237,0.22), transparent 60%)",
                zIndex: 0,
                pointerEvents: "none",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hoverFiles ? 0.35 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <FileText size={18} color="#a5b4fc" />
                <div>
                  <div style={{ color: "#e5e7eb", fontWeight: 700 }}>Your Files</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Download or delete encrypted uploads</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ color: "#94a3b8", padding: "0.5rem 0" }}>Loading files...</div>
            ) : files.length === 0 ? (
              <div
                style={{
                  padding: "1rem",
                  border: "1px dashed rgba(148,163,184,0.35)",
                  borderRadius: "12px",
                  color: "#94a3b8",
                  textAlign: "center",
                }}
              >
                No files yet. Upload your first encrypted file.
              </div>
            ) : (
              <div>
                {window.innerWidth >= 640 ? (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Filename</th>
                        <th style={thStyle}>Uploaded</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => (
                        <tr key={file.id}>
                          <td style={tdStyle}>{file.filename}</td>
                          <td style={{ ...tdStyle, color: "#cbd5e1" }}>
                            {new Date(file.uploaded_at).toLocaleString()}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            <button
                              style={{ ...buttonGhost, marginRight: "0.35rem" }}
                              onClick={() => handleDownload(file.filename)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                            >
                              <CloudDownload size={16} />
                            </button>
                            <button
                              style={{ ...buttonGhost, borderColor: "rgba(248,113,113,0.4)", color: "#fecdd3" }}
                              onClick={() => handleDelete(file.filename)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        style={{
                          padding: "0.85rem",
                          border: "1px solid rgba(148,163,184,0.2)",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <FileText size={16} color="#a5b4fc" />
                          <div style={{ color: "#e5e7eb", fontWeight: 600, flex: 1, wordBreak: "break-word" }}>
                            {file.filename}
                          </div>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.65rem" }}>
                          {new Date(file.uploaded_at).toLocaleString()}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            style={{ ...buttonGhost, flex: 1 }}
                            onClick={() => handleDownload(file.filename)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                          >
                            <CloudDownload size={16} /> Download
                          </button>
                          <button
                            style={{ ...buttonGhost, flex: 1, borderColor: "rgba(248,113,113,0.4)", color: "#fecdd3" }}
                            onClick={() => handleDelete(file.filename)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center" }} ref={logoutRef}>
          <button
            style={{ ...buttonSolid, minWidth: "200px" }}
            onClick={logout}
            onMouseEnter={(e) => handleMouseEnter(e, true)}
            onMouseLeave={(e) => handleMouseLeave(e, true)}
            onMouseDown={handleMouseDown}
            onMouseUp={(e) => handleMouseUp(e, true)}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "rgba(17,24,39,0.92)",
              border: "1px solid rgba(148,163,184,0.35)",
              borderRadius: "16px",
              padding: "1.25rem",
              width: "min(420px, 100%)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
              color: "#e5e7eb",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>Confirm Logout</div>
            <div style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
              You are about to sign out of SecureSafe. Are you sure you want to continue?
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                style={buttonGhost}
                onClick={cancelLogout}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                Stay signed in
              </button>
              <button
                style={{ ...buttonSolid, minWidth: "140px" }}
                onClick={confirmLogout}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "rgba(17,24,39,0.92)",
              border: "1px solid rgba(248,113,113,0.45)",
              borderRadius: "16px",
              padding: "1.25rem",
              width: "min(420px, 100%)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
              color: "#e5e7eb",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.35rem", color: "#fecdd3" }}>Confirm Delete</div>
            <div style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
              Are you sure you want to permanently delete <strong style={{ color: "#e5e7eb" }}>{fileToDelete}</strong>? This action cannot be undone.
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                style={buttonGhost}
                onClick={cancelDelete}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                Cancel
              </button>
              <button
                style={{ ...buttonSolid, minWidth: "140px", background: "linear-gradient(90deg, #dc2626, #b91c1c)" }}
                onClick={confirmDelete}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
