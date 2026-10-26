import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../config/api";
import "./dailyReports.css";

const toPersianTime = (time) => {
  if (!time) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
    hour12: false,
  }).format(new Date(time));
};

const toPersianDate = (d) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(d));

export default function DayDetails() {
  const { date } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          apiUrl(`/attendance/reports/day-details?date=${date}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const createDiscrepancy = async (id) => {
    const description = prompt("توضیح مغایرت را وارد کنید:");
    if (!description) return;

    await fetch(apiUrl(`/discrepancy/reports/${id}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description }),
    });

    alert("ثبت شد");
  };

  return (
    <div className="detailsPage">

      {/* HEADER */}
      <div className="detailsHeader">
        <button className="dr-btn ghost" onClick={() => navigate(-1)}>
          بستن
        </button>
        <div>{toPersianDate(date)}</div>
      </div>

      {/* LIST */}
      <div className="detailsList">
        {loading ? (
          <div>در حال دریافت...</div>
        ) : rows.length === 0 ? (
          <div>رکوردی وجود ندارد</div>
        ) : (
          rows.map((d) => (
            <div className="detailCard" key={d.id}>

              <div className="row">
                <strong>شعبه:</strong> {d.branch_name || "—"}
              </div>

              <div className="row">
                <strong>ورود:</strong> {toPersianTime(d.check_in)}
              </div>

              <div className="row">
                <strong>خروج:</strong> {toPersianTime(d.check_out)}
              </div>

              <div className="row">
                <strong>مدت:</strong>{" "}
                {typeof d.worked_hours === "number"
                  ? d.worked_hours.toFixed(1)
                  : "—"}
              </div>

              {/* 🔥 دکمه مهم */}
              <button
                className="dr-btn small"
                onClick={() => createDiscrepancy(d.id)}
              >
                ثبت مغایرت
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
