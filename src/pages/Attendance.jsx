import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import logo from "../assets/logo.png";
import "./Attendance.css";

export default function Attendance() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [report, setReport] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationReady, setLocationReady] = useState(false);

  const token = localStorage.getItem("token");

  // -------------------------
  // AUTH CHECK
  // -------------------------
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // -------------------------
  // GEOLOCATION (REAL SAFE)
  // -------------------------
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("مرورگر شما از لوکیشن پشتیبانی نمی‌کند");
      setLocationReady(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationReady(true);
      },
      () => {
        setError("دسترسی به موقعیت مکانی رد شد");
        setLocationReady(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  // -------------------------
  // FETCH INITIAL DATA
  // -------------------------
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setPageLoading(true);

        const statusRes = await fetch(apiUrl("/attendance/status"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (statusRes.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        if (statusRes.ok) {
          const data = await statusRes.json();
          setCheckedIn(data.is_checked_in || false);
        }

        const branchRes = await fetch(apiUrl("/attendance/branches"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (branchRes.ok) {
          const data = await branchRes.json();
          setBranches(data || []);
        }
      } catch {
        setError("خطا در دریافت اطلاعات");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // -------------------------
  // SAFE ERROR HANDLER (FIX اصلی)
  // -------------------------
  const extractErrorMessage = async (response) => {
    let text = "";

    try {
      text = await response.text();
    } catch {
      return "خطا در دریافت پاسخ سرور";
    }

    let msg = text;

    try {
      const json = JSON.parse(text);
      msg = json?.message || text;
    } catch {}

    msg = msg.toLowerCase();

    if (msg.includes("employee not found")) return "کارمند یافت نشد";
    if (msg.includes("not assigned")) return "شما به این شعبه دسترسی ندارید";
    if (msg.includes("branch not found")) return "شعبه پیدا نشد";
    if (msg.includes("not inside branch")) return "شما داخل محدوده شعبه نیستید";
    if (msg.includes("no open attendance")) return "شیفت باز برای خروج وجود ندارد";
    if (msg.includes("must be inside")) return "برای خروج باید داخل شعبه باشید";
    if (msg.includes("you have an open")) return "شیفت قبلی هنوز بسته نشده";

    return text || "خطای نامشخص";
  };

  // -------------------------
  // CHECK IN
  // -------------------------
  const handleCheckin = async () => {
    if (!selectedBranch) return setError("شعبه را انتخاب کنید");
    if (!locationReady) return setError("لوکیشن فعال نیست");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/attendance/checkin"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branchID: Number(selectedBranch),
          lat,
          long: lng,
          report,
        }),
      });

      if (res.ok) {
        setCheckedIn(true);
        setReport("");
        setError("");
        alert("✅ ورود ثبت شد");
      } else {
        setError(await extractErrorMessage(res));
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // CHECK OUT
  // -------------------------
  const handleCheckout = async () => {
    if (!locationReady) return setError("لوکیشن فعال نیست");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/attendance/checkout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat,
          long: lng,
          report,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        setCheckedIn(false);
        setReport("");

        alert(
          `خروج ثبت شد\nساعت کار: ${data.worked_hours || "-"}`
        );
      } else {
        setError(await extractErrorMessage(res));
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // LOADING UI
  // -------------------------
  if (pageLoading) {
    return (
      <div className="attendance-container" dir="rtl">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="attendance-container" dir="rtl">

<div className="attendance-header">

  {/* LEFT: LOGO */}
  <div className="logo-box">
    <img
      src={logo}
      alt="logo"
      className="logo-img"
    />

    <div className="logo-text">
      <h3>تکسا</h3>
      <span></span>
    </div>
  </div>

  {/* RIGHT: BACK BUTTON */}
  <button className="back-btn" onClick={() => navigate("/home")}>
    ← بازگشت
  </button>

</div>

      {/* STATUS */}
      <div className={`status-card ${checkedIn ? "online" : "offline"}`}>
        <h3>{checkedIn ? "در حال کار" : "خارج از شیفت"}</h3>
      </div>

      {/* LOCATION WARNING */}
      {!locationReady && (
        <div className="error-box">
          لوکیشن فعال نیست
        </div>
      )}

      {/* BRANCH */}
      <div className="card">
        <label>شعبه</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={checkedIn}
        >
          <option value="">انتخاب</option>
          {branches.map((b) => (
            <option key={b.id || b.ID} value={b.id || b.ID}>
              {b.name || b.Name}
            </option>
          ))}
        </select>
      </div>

      {/* REPORT */}
      {checkedIn && (
        <div className="card">
          <label>گزارش</label>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
          />
        </div>
      )}

      {/* ACTION */}
      <div className="action-section">
        {!checkedIn ? (
          <button
            onClick={handleCheckin}
            disabled={loading || !locationReady}
          >
            ثبت ورود
          </button>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading || !locationReady}
          >
            ثبت خروج
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && <div className="error-box">{error}</div>}
    </div>
  );
}
