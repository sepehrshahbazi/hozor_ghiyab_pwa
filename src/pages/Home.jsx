import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setUser({
      username: localStorage.getItem("username"),
    });

    setPageLoading(false);
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (pageLoading) {
    return (
      <div className="loading-container">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="home-container" dir="rtl">

      {/* ===== HEADER ===== */}
      <div className="home-header">

        {/* بخش چپ: دکمه بازگشت + لوگو */}
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ بازگشت
          </button>

          <div className="logo-box">
            <img
              src={logo}
              alt="logo"
              className="logo-img"
            />
            <div className="logo-text">
              <h3>پنل کاربری</h3>
              <span>سلام {user?.username || "کاربر"}</span>
            </div>
          </div>
        </div>

        {/* دکمه خروج - حتماً در سمت راست قرار می‌گیرد */}
        <button className="logout-btn" onClick={handleLogout}>
          خروج
        </button>

      </div>

      {/* ===== LINE ===== */}
      <div className="glow-line"></div>

      {/* ===== CARDS ===== */}
      <div className="cards-container">

        <div className="nav-card" onClick={() => navigate("/attendance")}>
          <div className="card-icon">📍</div>
          <div className="card-text">
            <h2>حضور و غیاب</h2>
            <p>ثبت ورود و خروج روزانه</p>
          </div>
        </div>

        <div className="nav-card" onClick={() => navigate("/reports/daily")}>
          <div className="card-icon">📅</div>
          <div className="card-text">
            <h2>گزارش روزانه</h2>
            <p>مشاهده گزارش‌های کاری</p>
          </div>
        </div>

      </div>

    </div>
  );
}
