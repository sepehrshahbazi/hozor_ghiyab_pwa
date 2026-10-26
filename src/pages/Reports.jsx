import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./splash.css";

export default function Splash() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند");
      return;
    }

    setIsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem("userLat", position.coords.latitude);
        localStorage.setItem("userLng", position.coords.longitude);
        navigate("/home");
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) {
          // دسترسی رد شده (چه قبلاً، چه همین الان)
          setError("❌ دسترسی به موقعیت مکانی رد شد.\nبرای فعال کردن دسترسی، روی دکمه زیر کلیک کن و مجوز موقعیت رو به «اجازه» تغییر بده.");
        } else if (err.code === 2) {
          setError("موقعیت در دسترس نیست، دوباره تلاش کن");
        } else if (err.code === 3) {
          setError("دریافت موقعیت وقت گیر شد، اتصال اینترنت رو چک کن");
        } else {
          setError("خطای ناشناخته، دوباره تلاش کن");
        }
      }
    );
  };

  // باز کردن صفحه تنظیمات موقعیت در مرورگر
  const openBrowserSettings = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome") && !ua.includes("Edg"))
      window.open("chrome://settings/content/location", "_blank");
    else if (ua.includes("Firefox"))
      window.open("about:preferences#privacy", "_blank");
    else if (ua.includes("Edg"))
      window.open("edge://settings/content/location", "_blank");
    else
      alert("لطفاً دسترسی موقعیت را از تنظیمات مرورگر خود فعال کن.");
  };

  return (
    <div className="splash-container">
      <div className="content">
        <div className="logo-box">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
          </svg>
          <h1>Company Logo</h1>
        </div>

        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>در حال دریافت موقعیت شما...</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <p className="error-icon">⚠️</p>
            <p className="error-message" style={{ whiteSpace: "pre-line" }}>{error}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
              <button onClick={requestLocation} className="retry-btn">
                تلاش مجدد
              </button>
              {error.includes("رد شد") && (
                <button onClick={openBrowserSettings} className="settings-btn">
                  تنظیمات مرورگر
                </button>
              )}
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="loading-text">در حال آماده‌سازی...</div>
        )}
      </div>
    </div>
  );
}