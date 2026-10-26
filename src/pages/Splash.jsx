// Splash.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./splash.css";

export default function Splash() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [needsUserAction, setNeedsUserAction] = useState(false);

  useEffect(() => {
    const storedLat = Number.parseFloat(localStorage.getItem("userLat"));
    const storedLng = Number.parseFloat(localStorage.getItem("userLng"));

    // اگر قبلاً لوکیشن ذخیره شده بود
    if (Number.isFinite(storedLat) && Number.isFinite(storedLng)) {
      navigate("/home");
      return;
    }

    checkPermission();
  }, []);

  const checkPermission = async () => {
    // پشتیبانی مرورگر
    if (!navigator.geolocation) {
      setError("مرورگر شما از دریافت موقعیت مکانی پشتیبانی نمی‌کند");
      return;
    }

    // HTTPS check
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setError("برای درخواست مجوز لوکیشن، صفحه باید با https باز شود.");
      return;
    }

    try {
      // بررسی permission
      if (navigator.permissions?.query) {
        const perm = await navigator.permissions.query({
          name: "geolocation",
        });

        // قبلاً اجازه داده شده
        if (perm.state === "granted") {
          requestLocation();
          return;
        }

        // هنوز تصمیم نگرفته → دکمه نمایش بده
        if (perm.state === "prompt") {
          setNeedsUserAction(true);
          return;
        }

        // قبلاً رد شده
        if (perm.state === "denied") {
          setPermissionDenied(true);
          setError("❌ دسترسی موقعیت مکانی قبلاً رد شده است.");
          return;
        }
      } else {
        // مرورگر قدیمی
        setNeedsUserAction(true);
      }
    } catch (err) {
      setNeedsUserAction(true);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("مرورگر شما از دریافت موقعیت مکانی پشتیبانی نمی‌کند");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setError("برای درخواست مجوز لوکیشن، صفحه باید با https باز شود.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPermissionDenied(false);
    setNeedsUserAction(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        localStorage.setItem("userLat", lat);
        localStorage.setItem("userLng", lng);

        navigate("/home");
      },

      (err) => {
        setIsLoading(false);

        switch (err.code) {
          case 1:
            setPermissionDenied(true);
            setError("❌ دسترسی به موقعیت مکانی رد شده است.");
            break;

          case 2:
            setError("📍 موقعیت مکانی در دسترس نیست.");
            break;

          case 3:
            setError(
              "⏱️ دریافت موقعیت زمان‌بر شد، اینترنت یا GPS را بررسی کنید."
            );
            break;

          default:
            setError("⚠️ خطایی رخ داد، دوباره تلاش کنید.");
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // تشخیص نوع دستگاه
  const getDeviceGuide = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      return {
        title: "📱 راهنمای آیفون / آیپد",
        steps: [
          "برنامه Settings را باز کنید",
          "Privacy & Security → Location Services",
          "Location Services را روشن کنید",
          "Safari یا Chrome را پیدا کنید",
          "دسترسی را روی While Using App قرار دهید",
          "به سایت برگردید و دوباره تلاش کنید",
        ],
      };
    }

    if (isAndroid) {
      return {
        title: "🤖 راهنمای اندروید",
        steps: [
          "روی آیکون قفل کنار آدرس سایت بزنید",
          "Permissions را باز کنید",
          "Location را روی Allow قرار دهید",
          "اگر پیدا نشد:",
          "Settings → Apps → Chrome → Permissions",
          "Location را فعال کنید",
          "سپس به سایت برگردید",
        ],
      };
    }

    return {
      title: "💻 راهنمای دسکتاپ",
      steps: [
        "روی آیکون قفل کنار آدرس سایت کلیک کنید",
        "Location را پیدا کنید",
        "روی Allow قرار دهید",
        "صفحه را Refresh کنید",
      ],
    };
  };

  const guide = getDeviceGuide();

  return (
    <div className="splash-container">
      <div className="content">
        <div className="logo-box">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="currentColor"
            />
          </svg>

          <h1>Company Logo</h1>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>در حال دریافت موقعیت شما...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-box">
            <p className="error-icon">⚠️</p>

            <p className="error-message">{error}</p>

            {permissionDenied && (
              <div className="guide-box">
                <p className="guide-title">{guide.title}</p>

                <ul className="guide-steps">
                  {guide.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>

                <p className="guide-hint">
                  ✨ پس از انجام مراحل بالا، روی دکمه «تلاش مجدد» کلیک کنید.
                </p>
              </div>
            )}

            <button
              onClick={requestLocation}
              className="retry-btn"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Request Permission */}
        {!isLoading && !error && needsUserAction && (
          <div className="permission-box">
            <p className="permission-text">
              برای ادامه باید دسترسی موقعیت مکانی را فعال کنید.
            </p>

            <button
              onClick={requestLocation}
              className="retry-btn"
            >
              فعال کردن موقعیت مکانی
            </button>
          </div>
        )}

        {/* Initial */}
        {!isLoading && !error && !needsUserAction && (
          <div className="loading-text">
            در حال آماده‌سازی...
          </div>
        )}
      </div>
    </div>
  );
}