import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import "./dailyReports.css";

const toPersianDate = (gregorianDate) => {
  if (!gregorianDate) return "—";
  try {
    const date = new Date(gregorianDate);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tehran",
    }).format(date);
  } catch {
    return "—";
  }
};

const toPersianTime = (time) => {
  if (!time) return "—";
  try {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tehran",
      hour12: false,
    }).format(date);
  } catch {
    return "—";
  }
};

export default function DailyReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [selectedYear, setSelectedYear] = useState(1405);
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const persianYears = [1403, 1404, 1405, 1406, 1407];
  const persianMonths = [
    "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
    "مهر","آبان","آذر","دی","بهمن","اسفند",
  ];

  const loadDailySummary = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        apiUrl(`/attendance/reports/daily-summary?year=${selectedYear}&month=${selectedMonth}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("خطا در دریافت گزارش روزانه");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    if (token) loadDailySummary();
  }, [selectedYear, selectedMonth]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="daily-reports">
      {/* HEADER */}
      <div className="dr-header">
        <div className="dr-title">گزارش روزانه</div>
        <div className="dr-actions">
          <button className="dr-btn ghost" onClick={() => navigate("/home")}>بازگشت</button>
          <button className="dr-btn danger" onClick={handleLogout}>خروج</button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="dr-filters">
        <div className="dr-filter">
          <label>سال</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {persianYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="dr-filter">
          <label>ماه</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {persianMonths.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>

        <button className="dr-btn primary" onClick={loadDailySummary} disabled={loading}>
          {loading ? "در حال دریافت..." : "دریافت"}
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="dr-alert error">{error}</div>}

      {/* TABLE */}
      <div className="dr-tableWrap">
        <table className="dr-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>ورود</th>
              <th>خروج</th>
              <th>جزئیات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="dr-empty">داده‌ای برای نمایش نیست</td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={idx}>
                  <td>{toPersianDate(r.date)}</td>
                  <td>{r.first_check_in ? toPersianTime(r.first_check_in) : "—"}</td>
                  <td>{r.last_check_out ? toPersianTime(r.last_check_out) : "—"}</td>
                  <td>
                    <button
                      className="dr-btn small"
                      onClick={() => navigate(`/reports/${encodeURIComponent(r.date)}`)}
                    >
                      جزئیات
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
