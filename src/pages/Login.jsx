import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import logo from "../assets/logo.png"; // ✅ FIX: import مستقیم لوگو از assets خود فرانت‌اند

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("لطفاً نام کاربری و رمز عبور را وارد کنید");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("/employees/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        navigate("/home");
        return;
      }

      setError(data.message || "خطا در ورود");
    } catch {
      setError("مشکل در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <img
          // ✅ FIX: قبلاً src="/logo.png" بود که مسیر مطلق از ریشه دامنه حساب می‌شد،
          // برای همین درخواستش می‌رفت سمت بک‌اند (که چنین فایلی نداشت) نه فایل‌های فرانت.
          // حالا لوگو مستقیم از پوشه assets خود فرانت import شده، پس Vite خودش
          // موقع build یه فایل با اسم hash‌شده می‌سازه و مسیرش رو با base درست می‌کنه
          // (مثلاً /employee/assets/logo-xxxxx.png) که دقیقاً همونیه که بک‌اند serve می‌کنه.
          src={logo}
          alt="logo"
          style={styles.logo}
        />

        <h1 style={styles.title}>تکسا</h1>
        <p style={styles.subtitle}>سیستم حضور و غیاب</p>

        <input
          style={styles.input}
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>

        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f9ff",
    fontFamily: "sans-serif",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    border: "1px solid #e6f0ff",
    borderRadius: "24px",
    padding: "40px 30px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(47,128,237,0.12)",
  },

  logo: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
    borderRadius: "16px",
    marginBottom: "15px",
    boxShadow: "0 10px 30px rgba(47,128,237,0.15)",
  },

  title: {
    color: "#1b3a57",
    fontSize: "28px",
    margin: 0,
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    height: "52px",
    marginBottom: "14px",
    padding: "0 15px",

    borderRadius: "14px",
    border: "1px solid #dbeafe",

    outline: "none",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    height: "52px",
    borderRadius: "14px",

    border: "none",
    cursor: "pointer",

    background: "linear-gradient(135deg,#2f80ed,#3b82f6)",
    color: "white",

    fontWeight: "600",
    fontSize: "15px",

    marginTop: "10px",
  },

  error: {
    marginTop: "18px",
    padding: "12px",

    background: "#fff5f5",
    border: "1px solid #ffd6d6",

    color: "#dc2626",
    borderRadius: "12px",
    fontSize: "13px",
  },
};
