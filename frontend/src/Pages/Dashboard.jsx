import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldCheck, Upload, LogOut, CloudDownload, Trash2, FileText, RefreshCw, Settings, Activity, LifeBuoy, Eye, X, ArrowUp, ArrowDown, Search, Folder, FolderPlus, FolderOpen, Home, RotateCcw, Trash, Zap, Lock, FolderTree, FileSearch, Mail, HelpCircle, MessageCircle, FileImage, FileVideo, FileAudio, File, FileCode, FileSpreadsheet, Archive } from "lucide-react";

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
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sortField, setSortField] = useState("uploaded_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [userEmail, setUserEmail] = useState("");
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
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(60);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveFolderDialog, setShowMoveFolderDialog] = useState(false);
  const [fileToMove, setFileToMove] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute
  const WARNING_BEFORE_LOGOUT = 10 * 1000; // 10 seconds warning

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

  // Get file icon based on extension
  const getFileIcon = (filename, size = 16, color = "#a5b4fc") => {
    const ext = filename.split('.').pop().toLowerCase();
    
    // Remove .enc extension if present
    const actualExt = ext === 'enc' ? filename.split('.').slice(-2, -1)[0].toLowerCase() : ext;
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(actualExt)) {
      return <FileImage size={size} color={color} />;
    }
    // Videos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp'].includes(actualExt)) {
      return <FileVideo size={size} color={color} />;
    }
    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(actualExt)) {
      return <FileAudio size={size} color={color} />;
    }
    // PDF and Documents
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(actualExt)) {
      return <FileText size={size} color={color} />;
    }
    // Spreadsheets
    if (['xls', 'xlsx', 'csv', 'ods'].includes(actualExt)) {
      return <FileSpreadsheet size={size} color={color} />;
    }
    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'json', 'xml', 'yml', 'yaml', 'sql', 'sh', 'bat'].includes(actualExt)) {
      return <FileCode size={size} color={color} />;
    }
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(actualExt)) {
      return <Archive size={size} color={color} />;
    }
    // Default
    return <File size={size} color={color} />;
  };

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

  const fetchFolders = useCallback(async () => {
    try {
      const res = await apiRef.current.get("/folders");
      setFolders(res.data);
    } catch (err) {
      console.error("Failed to load folders", err);
    }
  }, []);

  const fetchDeletedFiles = useCallback(async () => {
    try {
      const res = await apiRef.current.get("/files/deleted");
      setDeletedFiles(res.data);
    } catch (err) {
      console.error("Failed to load deleted files", err);
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await apiRef.current.get("/me");
      setUserEmail(res.data.email);
    } catch (err) {
      console.error("Failed to load user info", err);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchUserInfo();
    fetchFolders();
    fetchDeletedFiles();
  }, [fetchFiles, fetchUserInfo, fetchFolders, fetchDeletedFiles]);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Hide warning if showing
    setShowInactivityWarning(false);
    
    // Set warning timer (show warning 10 seconds before logout)
    warningTimerRef.current = setTimeout(() => {
      warningShownRef.current = true;
      setShowInactivityWarning(true);
      setInactivityCountdown(10);
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setInactivityCountdown((prev) => {
          if (prev <= 1) {
            // Perform logout
            localStorage.removeItem("token");
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);
    
    // Set final logout timer
    inactivityTimerRef.current = setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/login");
    }, INACTIVITY_TIMEOUT);
  }, [navigate, INACTIVITY_TIMEOUT, WARNING_BEFORE_LOGOUT]);

  const extendSession = () => {
    resetInactivityTimer();
  };

  useEffect(() => {
    // Start inactivity tracking
    resetInactivityTimer();
    
    // Activity event listeners
    const events = ['mousedown', 'keypress', 'touchstart'];
    
    const handleActivity = () => {
      // Don't reset timer if warning is already showing
      if (warningShownRef.current) {
        return;
      }
      
      const now = Date.now();
      // Only reset if more than 1 second since last activity (avoid too frequent resets)
      if (now - lastActivityRef.current > 1000) {
        resetInactivityTimer();
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });
    
    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetInactivityTimer, navigate]);

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

      const response = await apiRef.current.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          }
        },
      });

      // Move file to current folder if in a folder
      if (currentFolder && response.data.id) {
        await apiRef.current.patch(`/files/${response.data.id}/folder`, {
          folder: currentFolder
        });
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchFiles();
      await fetchFolders();
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

  const handlePreview = async (filename) => {
    setPreviewLoading(true);
    setPreviewFile(filename);
    try {
      const res = await apiRef.current.get(`/download/${filename}`, {
        responseType: "blob",
      });
      
      // Get the MIME type from response headers or guess from filename
      const contentType = res.headers['content-type'] || getMimeType(filename);
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError("Preview failed");
      setPreviewFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const getMimeType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'aac': 'audio/aac',
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'csv': 'text/csv',
      'md': 'text/markdown',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

  const getFileType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio';
    if (['txt', 'json', 'xml', 'csv', 'log', 'md'].includes(ext)) return 'text';
    return 'unknown';
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "filename" ? "asc" : "desc");
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "filename") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
      return sortDirection === "asc" 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (sortField === "uploaded_at") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  }).filter(file => file.folder === currentFolder); // Filter by current folder

  const filteredFiles = sortedFiles.filter((file) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesFilename = file.filename.toLowerCase().includes(query);
    const matchesNotes = file.notes?.toLowerCase().includes(query);
    return matchesFilename || matchesNotes;
  });

  const handleDelete = (filename) => {
    setFileToDelete(filename);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await apiRef.current.delete(`/delete/${fileToDelete}`);
      await fetchFiles();
      await fetchDeletedFiles();
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    } catch (err) {
      setError("Delete failed");
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const restoreFile = async (fileId) => {
    try {
      await apiRef.current.post(`/files/${fileId}/restore`);
      await fetchFiles();
      await fetchDeletedFiles();
    } catch (err) {
      setError("Restore failed");
    }
  };

  const permanentDelete = async (fileId, filename) => {
    if (!window.confirm(`Permanently delete "${filename}"? This cannot be undone!`)) {
      return;
    }

    try {
      await apiRef.current.delete(`/files/${fileId}/permanent`);
      await fetchDeletedFiles();
    } catch (err) {
      setError("Permanent delete failed");
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

  const startEditingNote = (file) => {
    setEditingNoteId(file.id);
    setNoteText(file.notes || "");
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

  const saveNote = async (fileId) => {
    try {
      await apiRef.current.patch(`/files/${fileId}/notes`, {
        notes: noteText
      });
      await fetchFiles();
      setEditingNoteId(null);
      setNoteText("");
    } catch (err) {
      setError("Failed to save note");
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    try {
      await apiRef.current.post("/folders", { name: newFolderName.trim() });
      await fetchFolders();
      setShowFolderDialog(false);
      setNewFolderName("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create folder");
    }
  };

  const deleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Delete folder "${folderName}"? Files will be moved to root.`)) {
      return;
    }

    try {
      await apiRef.current.delete(`/folders/${folderId}`);
      await fetchFolders();
      await fetchFiles();
      if (currentFolder === folderName) {
        setCurrentFolder("");
      }
    } catch (err) {
      setError("Failed to delete folder");
    }
  };

  const openMoveDialog = (file) => {
    setFileToMove(file);
    setShowMoveFolderDialog(true);
  };

  const moveFileToFolder = async (targetFolder) => {
    if (!fileToMove) return;

    try {
      await apiRef.current.patch(`/files/${fileToMove.id}/folder`, {
        folder: targetFolder
      });
      await fetchFiles();
      setShowMoveFolderDialog(false);
      setFileToMove(null);
    } catch (err) {
      setError("Failed to move file");
    }
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
    { label: "Features", icon: Zap, target: "features", hasDropdown: true },
    { label: "Support", icon: LifeBuoy, target: "support", hasDropdown: true },
    { label: "Settings", icon: Settings, target: "settings", hasDropdown: true },
  ];

  const handleNavClick = (target) => {
    if (target === "settings") {
      setShowSettingsMenu(true);
      return;
    }
    if (target === "features") {
      setShowFeaturesMenu(true);
      return;
    }
    if (target === "support") {
      setShowSupportMenu(true);
      return;
    }
    if (target === "activity") {
      setShowActivity(true);
      return;
    }
    if (target === "uploads") {
      setShowUploads(true);
      return;
    }
    const map = {
      overview: shellRef,
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

  const formatDateIST = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={pillStyle}>
              <ShieldCheck size={17} />
              SecureSafe Vault
            </div>
            {userEmail && (
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.45rem",
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                background: "rgba(124,58,237,0.18)",
                border: "1px solid rgba(124,58,237,0.35)",
                color: "#e9d5ff",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}>
                👤 {userEmail}
              </div>
            )}
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

        <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginBottom: "1rem", position: "relative" }}>
          {navLinks.map((item) => (
            <div key={item.label} style={{ position: "relative" }}>
              <motion.button
                data-dropdown-button={item.hasDropdown ? "true" : undefined}
                style={{
                  ...buttonGhost,
                  background: (item.hasDropdown && ((item.target === "settings" && showSettingsMenu) || (item.target === "features" && showFeaturesMenu) || (item.target === "support" && showSupportMenu))) ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                  borderColor: (item.hasDropdown && ((item.target === "settings" && showSettingsMenu) || (item.target === "features" && showFeaturesMenu) || (item.target === "support" && showSupportMenu))) ? "rgba(124,58,237,0.5)" : "rgba(148,163,184,0.35)",
                }}
                onClick={() => handleNavClick(item.target)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={16} /> {item.label}
              </motion.button>
            </div>
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
                  <div style={{ color: "#e5e7eb", flex: 1 }}>
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
                {selectedFile && (
                  <button
                    type="button"
                    style={{
                      ...buttonGhost,
                      borderColor: "rgba(248,113,113,0.4)",
                      color: "#fecdd3",
                      marginRight: "0.5rem",
                      padding: "0.5rem",
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    title="Remove selected file"
                  >
                    <X size={16} />
                  </button>
                )}
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
                {showTrash ? <Trash size={18} color="#f87171" /> : <FileText size={18} color="#a5b4fc" />}
                <div>
                  <div style={{ color: "#e5e7eb", fontWeight: 700 }}>
                    {showTrash ? "Recently Deleted" : "Your Files"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                    {showTrash ? "Restore or permanently delete files" : "Download or delete encrypted uploads"}
                  </div>
                </div>
              </div>
              {showTrash ? (
                <button
                  style={{
                    ...buttonGhost,
                    padding: "0.5rem 0.75rem",
                  }}
                  onClick={() => setShowTrash(false)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                >
                  <ArrowUp size={16} style={{ transform: "rotate(-90deg)" }} />
                  Back to Files
                </button>
              ) : (
                <button
                  style={{
                    ...buttonGhost,
                    padding: "0.5rem 0.75rem",
                  }}
                  onClick={() => setShowFolderDialog(true)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                >
                  <FolderPlus size={16} />
                  New Folder
                </button>
              )}
            </div>

            {!showTrash && (
              <>
            {/* Folder Navigation */}
            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 1 }}>
              <button
                style={{
                  ...buttonGhost,
                  background: currentFolder === "" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                  borderColor: currentFolder === "" ? "rgba(59,130,246,0.5)" : "rgba(148,163,184,0.35)",
                  padding: "0.5rem 0.75rem",
                }}
                onClick={() => setCurrentFolder("")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <Home size={14} />
                All Files
              </button>
              {folders.map((folder) => (
                <div key={folder.id} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <button
                    style={{
                      ...buttonGhost,
                      background: currentFolder === folder.name ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                      borderColor: currentFolder === folder.name ? "rgba(59,130,246,0.5)" : "rgba(148,163,184,0.35)",
                      padding: "0.5rem 0.75rem",
                      paddingRight: "2rem",
                    }}
                    onClick={() => setCurrentFolder(folder.name)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                  >
                    {currentFolder === folder.name ? <FolderOpen size={14} /> : <Folder size={14} />}
                    {folder.name}
                  </button>
                  <button
                    onClick={() => deleteFolder(folder.id, folder.name)}
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      padding: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.7,
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = "1"}
                    onMouseLeave={(e) => e.target.style.opacity = "0.7"}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {files.length > 0 && (
              <>
                <div style={{ marginBottom: "1rem", position: "relative", zIndex: 1 }}>
                  <div style={{ position: "relative" }}>
                    <Search 
                      size={18} 
                      style={{ 
                        position: "absolute", 
                        left: "0.75rem", 
                        top: "50%", 
                        transform: "translateY(-50%)", 
                        color: "#94a3b8",
                        pointerEvents: "none"
                      }} 
                    />
                    <input
                      type="text"
                      placeholder="Search files by name or notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.75rem 0.65rem 2.75rem",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(148,163,184,0.3)",
                        borderRadius: "8px",
                        color: "#e5e7eb",
                        fontSize: "0.95rem",
                        outline: "none",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(59,130,246,0.5)";
                        e.target.style.background = "rgba(255,255,255,0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(148,163,184,0.3)";
                        e.target.style.background = "rgba(255,255,255,0.05)";
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "0.25rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                      Found {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 1 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem", marginRight: "0.25rem" }}>Sort by:</span>
                  <button
                  style={{
                    ...buttonGhost,
                    background: sortField === "filename" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                    borderColor: sortField === "filename" ? "rgba(59,130,246,0.5)" : "rgba(148,163,184,0.35)",
                    padding: "0.5rem 0.75rem",
                  }}
                  onClick={() => handleSort("filename")}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                >
                  <FileText size={14} />
                  Name
                  {sortField === "filename" && (
                    sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </button>
                <button
                  style={{
                    ...buttonGhost,
                    background: sortField === "uploaded_at" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                    borderColor: sortField === "uploaded_at" ? "rgba(59,130,246,0.5)" : "rgba(148,163,184,0.35)",
                    padding: "0.5rem 0.75rem",
                  }}
                  onClick={() => handleSort("uploaded_at")}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                >
                  <Activity size={14} />
                  Date
                  {sortField === "uploaded_at" && (
                    sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </button>
              </div>
              </>
            )}
            </>
            )}

            {showTrash ? (
              // Recently Deleted View
              deletedFiles.length === 0 ? (
                <div
                  style={{
                    padding: "2rem 1rem",
                    border: "1px dashed rgba(148,163,184,0.35)",
                    borderRadius: "12px",
                    color: "#94a3b8",
                    textAlign: "center",
                  }}
                >
                  <Trash size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No deleted files</div>
                  <div style={{ fontSize: "0.9rem" }}>Deleted files will appear here</div>
                </div>
              ) : (
                <div>
                  {window.innerWidth >= 640 ? (
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Filename</th>
                          <th style={thStyle}>Deleted</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deletedFiles.map((file) => (
                          <tr key={file.id}>
                            <td style={tdStyle}>{file.filename}</td>
                            <td style={{ ...tdStyle, color: "#cbd5e1" }}>
                              {formatDateIST(file.deleted_at)}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>
                              <button
                                style={{ ...buttonGhost, marginRight: "0.35rem", borderColor: "rgba(34,197,94,0.4)", color: "#86efac" }}
                                onClick={() => restoreFile(file.id)}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button
                                style={{ ...buttonGhost, borderColor: "rgba(248,113,113,0.4)", color: "#fecdd3" }}
                                onClick={() => permanentDelete(file.id, file.filename)}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                                title="Delete Forever"
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
                      {deletedFiles.map((file) => (
                        <div
                          key={file.id}
                          style={{
                            padding: "0.85rem",
                            border: "1px solid rgba(248,113,113,0.2)",
                            borderRadius: "12px",
                            background: "rgba(248,113,113,0.05)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <Trash2 size={16} color="#f87171" />
                            <div style={{ color: "#e5e7eb", fontWeight: 600, flex: 1, wordBreak: "break-word" }}>
                              {file.filename}
                            </div>
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.65rem" }}>
                            Deleted: {formatDateIST(file.deleted_at)}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button
                              style={{ ...buttonGhost, flex: 1, minWidth: "120px", borderColor: "rgba(34,197,94,0.4)", color: "#86efac" }}
                              onClick={() => restoreFile(file.id)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                            >
                              <RotateCcw size={16} /> Restore
                            </button>
                            <button
                              style={{ ...buttonGhost, flex: 1, minWidth: "120px", borderColor: "rgba(248,113,113,0.4)", color: "#fecdd3" }}
                              onClick={() => permanentDelete(file.id, file.filename)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                            >
                              <Trash2 size={16} /> Delete Forever
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : loading ? (
              <div style={{ color: "#94a3b8", padding: "0.5rem 0", position: "relative", zIndex: 1 }}>Loading files...</div>
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
            ) : filteredFiles.length === 0 ? (
              <div
                style={{
                  padding: "1rem",
                  border: "1px dashed rgba(148,163,184,0.35)",
                  borderRadius: "12px",
                  color: "#94a3b8",
                  textAlign: "center",
                }}
              >
                No files match your search.
              </div>
            ) : (
              <div>
                {window.innerWidth >= 640 ? (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Filename</th>
                        <th style={thStyle}>Notes</th>
                        <th style={thStyle}>Uploaded</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => (
                        <tr key={file.id}>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {getFileIcon(file.filename, 16, "#a5b4fc")}
                              <span>{file.filename}</span>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            {editingNoteId === file.id ? (
                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <input
                                  type="text"
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Add a note..."
                                  style={{
                                    flex: 1,
                                    padding: "0.4rem 0.6rem",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(148,163,184,0.3)",
                                    borderRadius: "6px",
                                    color: "#e5e7eb",
                                    fontSize: "0.9rem",
                                    outline: "none",
                                  }}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") saveNote(file.id);
                                    if (e.key === "Escape") cancelEditingNote();
                                  }}
                                  autoFocus
                                />
                                <button
                                  style={{ ...buttonGhost, padding: "0.4rem 0.6rem" }}
                                  onClick={() => saveNote(file.id)}
                                  onMouseEnter={handleMouseEnter}
                                  onMouseLeave={handleMouseLeave}
                                  onMouseDown={handleMouseDown}
                                  onMouseUp={handleMouseUp}
                                >
                                  Save
                                </button>
                                <button
                                  style={{ ...buttonGhost, padding: "0.4rem 0.6rem" }}
                                  onClick={cancelEditingNote}
                                  onMouseEnter={handleMouseEnter}
                                  onMouseLeave={handleMouseLeave}
                                  onMouseDown={handleMouseDown}
                                  onMouseUp={handleMouseUp}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{
                                  color: file.notes ? "#cbd5e1" : "#64748b",
                                  fontStyle: file.notes ? "normal" : "italic",
                                  cursor: "pointer",
                                }}
                                onClick={() => startEditingNote(file)}
                              >
                                {file.notes || "Add note..."}
                              </div>
                            )}
                          </td>
                          <td style={{ ...tdStyle, color: "#cbd5e1" }}>
                            {formatDateIST(file.uploaded_at)}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            <button
                              style={{ ...buttonGhost, marginRight: "0.35rem" }}
                              onClick={() => handlePreview(file.filename)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              style={{ ...buttonGhost, marginRight: "0.35rem" }}
                              onClick={() => handleDownload(file.filename)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                              title="Download"
                            >
                              <CloudDownload size={16} />
                            </button>
                            <button
                              style={{ ...buttonGhost, marginRight: "0.35rem" }}
                              onClick={() => openMoveDialog(file)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                              title="Move to Folder"
                            >
                              <Folder size={16} />
                            </button>
                            <button
                              style={{ ...buttonGhost, borderColor: "rgba(248,113,113,0.4)", color: "#fecdd3" }}
                              onClick={() => handleDelete(file.filename)}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                              title="Delete"
                            >
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
                    {filteredFiles.map((file) => (
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
                          {getFileIcon(file.filename, 16, "#a5b4fc")}
                          <div style={{ color: "#e5e7eb", fontWeight: 600, flex: 1, wordBreak: "break-word" }}>
                            {file.filename}
                          </div>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.65rem" }}>
                          {formatDateIST(file.uploaded_at)}
                        </div>
                        {editingNoteId === file.id ? (
                          <div style={{ marginBottom: "0.65rem" }}>
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add a note..."
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(148,163,184,0.3)",
                                borderRadius: "6px",
                                color: "#e5e7eb",
                                fontSize: "0.9rem",
                                outline: "none",
                                marginBottom: "0.5rem",
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") saveNote(file.id);
                                if (e.key === "Escape") cancelEditingNote();
                              }}
                              autoFocus
                            />
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                style={{ ...buttonGhost, flex: 1 }}
                                onClick={() => saveNote(file.id)}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                              >
                                Save
                              </button>
                              <button
                                style={{ ...buttonGhost, flex: 1 }}
                                onClick={cancelEditingNote}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "0.5rem",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(148,163,184,0.15)",
                              borderRadius: "6px",
                              color: file.notes ? "#cbd5e1" : "#64748b",
                              fontStyle: file.notes ? "normal" : "italic",
                              fontSize: "0.85rem",
                              marginBottom: "0.65rem",
                              cursor: "pointer",
                            }}
                            onClick={() => startEditingNote(file)}
                          >
                            {file.notes || "Add note..."}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <button
                            style={{ ...buttonGhost, flex: 1, minWidth: "100px" }}
                            onClick={() => handlePreview(file.filename)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                          >
                            <Eye size={16} /> Preview
                          </button>
                          <button
                            style={{ ...buttonGhost, flex: 1, minWidth: "100px" }}
                            onClick={() => handleDownload(file.filename)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                          >
                            <CloudDownload size={16} /> Download
                          </button>
                          <button
                            style={{ ...buttonGhost, flex: 1, minWidth: "100px" }}
                            onClick={() => openMoveDialog(file)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                          >
                            <Folder size={16} /> Move
                          </button>
                          <button
                            style={{ ...buttonGhost, flex: 1, minWidth: "100px", borderColor: "rgba(248,113,113,0.4)", color: "#fecdd3" }}
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

        <div style={{ marginTop: "1.25rem" }} ref={logoutRef}>
          {/* Settings section - Logout moved to navbar dropdown */}
        </div>
      </div>

      {showInactivityWarning && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 25,
            padding: "1rem",
          }}
        >
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 25,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "rgba(17,24,39,0.95)",
              border: "1px solid rgba(251,191,36,0.5)",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "min(420px, 100%)",
              boxShadow: "0 24px 60px rgba(251,191,36,0.2)",
              color: "#e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Activity size={24} color="#fbbf24" />
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fbbf24" }}>Session Timeout Warning</div>
            </div>
            <div style={{ color: "#cbd5e1", marginBottom: "1rem", fontSize: "0.95rem" }}>
              You've been inactive for a while. For security reasons, you will be automatically logged out in{" "}
              <strong style={{ color: "#fbbf24", fontSize: "1.1rem" }}>{inactivityCountdown}</strong> seconds.
            </div>
            <div style={{ color: "#94a3b8", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
              Click "Stay Logged In" to continue your session, or you'll be logged out automatically.
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                style={{ ...buttonSolid, minWidth: "160px", background: "linear-gradient(90deg, #f59e0b, #d97706)" }}
                onClick={extendSession}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}

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

      {previewFile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
            padding: "1rem",
          }}
          onClick={closePreview}
        >
          <div
            style={{
              position: "relative",
              background: "rgba(17,24,39,0.95)",
              border: "1px solid rgba(148,163,184,0.35)",
              borderRadius: "16px",
              padding: "1.5rem",
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "fit-content",
              boxShadow: "0 24px 60px rgba(0,0,0,0.65)",
              color: "#e5e7eb",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#e5e7eb", wordBreak: "break-word", paddingRight: "1rem" }}>
                {previewFile}
              </div>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onClick={closePreview}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(148,163,184,0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
              {previewLoading ? (
                <div style={{ color: "#cbd5e1" }}>Loading preview...</div>
              ) : previewUrl ? (
                (() => {
                  const fileType = getFileType(previewFile);
                  switch (fileType) {
                    case 'image':
                      return (
                        <img
                          src={previewUrl}
                          alt={previewFile}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "70vh",
                            objectFit: "contain",
                            borderRadius: "8px",
                          }}
                        />
                      );
                    case 'pdf':
                      return (
                        <iframe
                          src={previewUrl}
                          title={previewFile}
                          style={{
                            width: "80vw",
                            height: "70vh",
                            border: "none",
                            borderRadius: "8px",
                          }}
                        />
                      );
                    case 'video':
                      return (
                        <video
                          src={previewUrl}
                          controls
                          style={{
                            maxWidth: "100%",
                            maxHeight: "70vh",
                            borderRadius: "8px",
                          }}
                        />
                      );
                    case 'audio':
                      return (
                        <audio
                          src={previewUrl}
                          controls
                          style={{
                            width: "100%",
                            maxWidth: "500px",
                          }}
                        />
                      );
                    case 'text':
                      return (
                        <iframe
                          src={previewUrl}
                          title={previewFile}
                          style={{
                            width: "80vw",
                            height: "70vh",
                            border: "none",
                            borderRadius: "8px",
                            background: "#fff",
                          }}
                        />
                      );
                    default:
                      return (
                        <div style={{ textAlign: "center", color: "#cbd5e1" }}>
                          <FileText size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                          <div>Preview not available for this file type.</div>
                          <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.7 }}>Please download to view.</div>
                        </div>
                      );
                  }
                })()
              ) : null}
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                style={{ ...buttonGhost }}
                onClick={() => handleDownload(previewFile)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <CloudDownload size={16} /> Download
              </button>
              <button
                style={{ ...buttonSolid }}
                onClick={closePreview}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Dialog */}
      {showFolderDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowFolderDialog(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.3)",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FolderPlus size={20} color="#a5b4fc" />
              Create New Folder
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(148,163,184,0.3)",
                borderRadius: "8px",
                color: "#e5e7eb",
                fontSize: "1rem",
                outline: "none",
                marginBottom: "1rem",
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") createFolder();
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                style={{ ...buttonGhost }}
                onClick={() => {
                  setShowFolderDialog(false);
                  setNewFolderName("");
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                Cancel
              </button>
              <button
                style={{ ...buttonSolid }}
                onClick={createFolder}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to Folder Dialog */}
      {showMoveFolderDialog && fileToMove && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => {
            setShowMoveFolderDialog(false);
            setFileToMove(null);
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.3)",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Folder size={20} color="#a5b4fc" />
              Move "{fileToMove.filename}"
            </h3>
            <div style={{ marginBottom: "1rem" }}>
              <button
                style={{
                  ...buttonGhost,
                  width: "100%",
                  justifyContent: "flex-start",
                  marginBottom: "0.5rem",
                }}
                onClick={() => moveFileToFolder("")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <Home size={16} />
                Root (All Files)
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  style={{
                    ...buttonGhost,
                    width: "100%",
                    justifyContent: "flex-start",
                    marginBottom: "0.5rem",
                    opacity: fileToMove.folder === folder.name ? 0.5 : 1,
                  }}
                  onClick={() => moveFileToFolder(folder.name)}
                  disabled={fileToMove.folder === folder.name}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                >
                  <Folder size={16} />
                  {folder.name}
                  {fileToMove.folder === folder.name && " (Current)"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                style={{ ...buttonGhost }}
                onClick={() => {
                  setShowMoveFolderDialog(false);
                  setFileToMove(null);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploads Statistics Dialog */}
      {showUploads && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowUploads(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem", fontWeight: 700 }}>
              <Upload size={24} color="#a5b4fc" />
              Upload Statistics
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ color: "#60a5fa", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.5rem" }}>Total Files</div>
                <div style={{ color: "#e5e7eb", fontSize: "1.8rem", fontWeight: 700 }}>{files.length}</div>
              </div>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <div style={{ color: "#c084fc", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.5rem" }}>Total Size</div>
                <div style={{ color: "#e5e7eb", fontSize: "1.8rem", fontWeight: 700 }}>
                  {formatBytes(files.reduce((acc, file) => acc + (file.size || 0), 0))}
                </div>
              </div>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div style={{ color: "#4ade80", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.5rem" }}>Encrypted</div>
                <div style={{ color: "#e5e7eb", fontSize: "1.8rem", fontWeight: 700 }}>100%</div>
              </div>
            </div>
            <div style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "10px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Lock size={18} color="#fbbf24" />
                <div style={{ color: "#fbbf24", fontSize: "0.95rem", fontWeight: 600 }}>Security Status</div>
              </div>
              <div style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>
                All your files are protected with AES-256 encryption. Each upload is automatically encrypted before storage.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ color: "#cbd5e1", fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>Recent Uploads</div>
              {files.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.95rem" }}>
                  <Upload size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                  <div>No files uploaded yet</div>
                  <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", opacity: 0.7 }}>Start by uploading your first file</div>
                </div>
              ) : (
                [...files]
                  .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
                  .slice(0, 6)
                  .map((file, index) => (
                    <div
                      key={file.id}
                      style={{
                        padding: "0.875rem",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(148,163,184,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setShowUploads(false);
                        handlePreview(file.filename);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: `linear-gradient(135deg, ${['rgba(59,130,246,0.2)', 'rgba(168,85,247,0.2)', 'rgba(34,197,94,0.2)', 'rgba(251,191,36,0.2)', 'rgba(239,68,68,0.2)', 'rgba(6,182,212,0.2)'][index % 6]}, rgba(124,58,237,0.2))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(124,58,237,0.3)",
                      }}>
                        {getFileIcon(file.filename, 20, "#a5b4fc")}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {file.filename}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                          {formatBytes(file.size)} • {formatDateIST(file.uploaded_at)}
                        </div>
                      </div>
                      <div style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "6px",
                        background: "rgba(34,197,94,0.15)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        color: "#4ade80",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}>
                        <Lock size={12} />
                        Encrypted
                      </div>
                    </div>
                  ))
              )}
              {files.length > 6 && (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  And {files.length - 6} more files...
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                style={{ ...buttonSolid }}
                onClick={() => setShowUploads(false)}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Dialog */}
      {showActivity && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowActivity(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem", fontWeight: 700 }}>
              <Activity size={24} color="#a5b4fc" />
              Recent Activity
            </h3>
            <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Total Files: <span style={{ color: "#60a5fa", fontWeight: 600 }}>{files.length}</span></div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.3rem" }}>Deleted Files: <span style={{ color: "#f87171", fontWeight: 600 }}>{deletedFiles.length}</span></div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.3rem" }}>Folders: <span style={{ color: "#c084fc", fontWeight: 600 }}>{folders.length}</span></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ color: "#cbd5e1", fontSize: "1.05rem", fontWeight: 600, marginTop: "1rem", marginBottom: "0.5rem" }}>Recent Files</div>
              {files.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.95rem" }}>
                  No files uploaded yet
                </div>
              ) : (
                files.slice(0, 5).map((file, index) => (
                  <div
                    key={file.id}
                    style={{
                      padding: "0.875rem",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(148,163,184,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(124,58,237,0.3)",
                    }}>
                      {getFileIcon(file.filename, 16, "#a5b4fc")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {file.filename}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                        Uploaded {formatDateIST(file.uploaded_at)}
                      </div>
                    </div>
                    <div style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "6px",
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      color: "#4ade80",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}>
                      Active
                    </div>
                  </div>
                ))
              )}
              {files.length > 5 && (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  And {files.length - 5} more files...
                </div>
              )}
              {deletedFiles.length > 0 && (
                <>
                  <div style={{ color: "#cbd5e1", fontSize: "1.05rem", fontWeight: 600, marginTop: "1rem", marginBottom: "0.5rem" }}>Recently Deleted</div>
                  {deletedFiles.slice(0, 3).map((file, index) => (
                    <div
                      key={file.id}
                      style={{
                        padding: "0.875rem",
                        borderRadius: "10px",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(239,68,68,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}>
                        <Trash size={16} color="#f87171" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {file.filename}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                          Deleted {file.deleted_at ? formatDateIST(file.deleted_at) : "Recently"}
                        </div>
                      </div>
                      <div style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "6px",
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#f87171",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}>
                        Deleted
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                style={{ ...buttonSolid }}
                onClick={() => setShowActivity(false)}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Dialog */}
      {showFAQs && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowFAQs(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem", fontWeight: 700 }}>
              <HelpCircle size={24} color="#a5b4fc" />
              Frequently Asked Questions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ color: "#60a5fa", fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>Q: How secure is my data?</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>Your files are encrypted with military-grade AES encryption. Only you have access to your encrypted files using your secure credentials.</div>
              </div>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <div style={{ color: "#c084fc", fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>Q: Can I restore deleted files?</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>Yes! Files moved to "Recently Deleted" can be restored anytime. You can access them from Settings menu and permanently delete them when you're ready.</div>
              </div>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div style={{ color: "#4ade80", fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>Q: How do I organize my files?</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>You can create folders and move files between them. Use the folder icon next to each file to organize your content efficiently.</div>
              </div>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <div style={{ color: "#fbbf24", fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>Q: What file types are supported?</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>SecureSafe supports all file types including documents, images, videos, and more. Each file is securely encrypted before storage.</div>
              </div>
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ color: "#f87171", fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>Q: How long does the session last?</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>For security, you'll be automatically logged out after 1 minute of inactivity. You'll receive a 10-second warning before logout.</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                style={{ ...buttonSolid }}
                onClick={() => setShowFAQs(false)}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Dialog */}
      {showFeaturesMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowFeaturesMenu(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(124,58,237,0.3)",
              boxShadow: "0 24px 60px rgba(124,58,237,0.4)",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem", fontWeight: 700 }}>
              <Zap size={24} color="#a78bfa" />
              App Features
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <Lock size={20} style={{ marginTop: "0.15rem", color: "#60a5fa" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>AES Encryption</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Military-grade file encryption keeps your data secure with industry-standard AES-256 encryption</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <FolderTree size={20} style={{ marginTop: "0.15rem", color: "#c084fc" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>Folder Organization</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Organize your encrypted files into custom folders for better management and easy access</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <FileSearch size={20} style={{ marginTop: "0.15rem", color: "#4ade80" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>Smart Search</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Quickly find your files by searching through names and notes with our intelligent search system</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <Trash size={20} style={{ marginTop: "0.15rem", color: "#fbbf24" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>Recently Deleted</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Restore accidentally deleted files safely with our recovery system before permanent deletion</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                style={{ ...buttonSolid }}
                onClick={() => setShowFeaturesMenu(false)}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Dialog */}
      {showSupportMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowSupportMenu(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(34,197,94,0.3)",
              boxShadow: "0 24px 60px rgba(34,197,94,0.4)",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem", fontWeight: 700 }}>
              <HelpCircle size={24} color="#4ade80" />
              Get Help & Support
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <Mail size={20} style={{ marginTop: "0.15rem", color: "#60a5fa" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>Email Support</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>support@securesafe.com</div>
                  <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Send us an email for detailed inquiries and we'll get back to you within 24 hours</div>
                </div>
              </div>
              <div 
                style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", cursor: "pointer" }}
                onClick={() => {
                  setShowFAQs(true);
                  setShowSupportMenu(false);
                }}
              >
                <HelpCircle size={20} style={{ marginTop: "0.15rem", color: "#c084fc" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>Help Center</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Common Q & A</div>
                  <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Browse our frequently asked questions for instant answers</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <MessageCircle size={20} style={{ marginTop: "0.15rem", color: "#4ade80" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>Live Chat</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Feature coming soon</div>
                  <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Real-time chat support will be available soon for instant assistance</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "1.25rem", padding: "1rem", borderRadius: "10px", background: "rgba(148,163,184,0.05)", border: "1px solid rgba(148,163,184,0.15)" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center" }}>📞 Available 24/7 to assist you</div>
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                style={{ ...buttonSolid }}
                onClick={() => setShowSupportMenu(false)}
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={(e) => handleMouseLeave(e, true)}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, true)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      {showSettingsMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowSettingsMenu(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.97), rgba(15,23,42,0.97))",
              backdropFilter: "blur(20px)",
              padding: "1.75rem",
              borderRadius: "16px",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 24px 60px rgba(239,68,68,0.4)",
              maxWidth: "400px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#e5e7eb", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem", fontWeight: 700 }}>
              <Settings size={24} color="#ef4444" />
              Settings
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                style={{
                  ...buttonGhost,
                  width: "100%",
                  justifyContent: "flex-start",
                  background: showTrash ? "rgba(248,113,113,0.15)" : "transparent",
                  borderColor: showTrash ? "rgba(248,113,113,0.5)" : "rgba(148,163,184,0.3)",
                  padding: "1rem",
                  fontSize: "1rem",
                }}
                onClick={() => {
                  setShowTrash(!showTrash);
                  setShowSettingsMenu(false);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <Trash size={18} /> Recently Deleted ({deletedFiles.length})
              </button>
              <button
                style={{
                  ...buttonGhost,
                  width: "100%",
                  justifyContent: "flex-start",
                  background: "rgba(239,68,68,0.1)",
                  borderColor: "rgba(239,68,68,0.3)",
                  padding: "1rem",
                  fontSize: "1rem",
                }}
                onClick={() => {
                  setShowSettingsMenu(false);
                  logout();
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
