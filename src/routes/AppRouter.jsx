import { BrowserRouter, Routes, Route } from "react-router-dom"

import Splash from "../pages/Splash"
import Login from "../pages/Login"
import Home from "../pages/Home"
import Reports from "../pages/Reports"
import DailyReports from "../pages/DailyReports"
import Attendance from "../pages/Attendance"
import DayDetails from "../pages/DayDetails"

export default function AppRouter(){
  return(
    <BrowserRouter basename="/employee">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:date" element={<DayDetails />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports/daily" element={<DailyReports />} />
      </Routes>
    </BrowserRouter>
  )
}
