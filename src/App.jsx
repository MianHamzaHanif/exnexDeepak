// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import { Toaster } from "react-hot-toast";
import Web3Listener from "./Components/Web3Listener";
import { Web3Provider } from "./Context/Web3Context";
import "./App.css";
import PrivateRoutes from "./Utility/PrivateRoutes";
import Home from "./Components/HomePage/home";
import Dashboard from "./Components/Dashboard/Dashboard";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
import Forget from "./Components/ForgetPassword/Forget";
import ActivationContract from "./Components/Activation/ActivationContract";
import ActivationHistory from "./Components/Activation/ActivationHistory";
import MyReferral from "./Components/MyTeam/MyReferral";
import LevelDetails from "./Components/MyTeam/LevelDetails";
import Downline from "./Components/MyTeam/Downline";
import VestingDirectIncome from "./Components/MyTeam/VestingDirectIncome";
import TradingIncome from "./Components/Income/TradingIncome";
import LevelIncome from "./Components/Income/LevelIncome";
import RoiLevelIncome from "./Components/Income/RoiLevelIncome";
import WithdrawLevelIncome from "./Components/Income/WithdrawLevelIncome";
import SalaryIncome from "./Components/Income/SalaryIncome";
import ClaimSalary from "./Components/Salary/ClaimSalary";
import ClaimPool from "./Components/Pool/ClaimPool";
import PoolHistory from "./Components/Pool/PoolHistory";
import Withdrawal from "./Components/Withdrawal/Withdrawal";
import WithdrawalHistory from "./Components/Withdrawal/WithdrawalHistory";
import VestingHistory from "./Components/Withdrawal/VestingHistory";
import ApproveSalary from "./Components/Withdrawal/ApproveSalary";
import Trading from "./Components/Trading/Trading";

// Main app content component
function HomeEntry() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hasReferral =
    !!params.get("ref") || !!params.get("referral") || !!params.get("referrer");

  if (hasReferral) {
    return <Navigate to={`/signup${location.search}`} replace />;
  }

  return <Home />;
}

function LoginEntry() {
  const location = useLocation();
  return <Navigate to={`/signup${location.search || ""}`} replace />;
}

function AppContent() {
  return (
    <>
      <Web3Listener>
        <Toaster 
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
            loading: {
              iconTheme: {
                primary: "#3b82f6",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<HomeEntry />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginEntry />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/Forget" element={<Forget />} />
          <Route path="/activationContract" element={<ActivationContract />} />
          <Route path="/activationHistory" element={<ActivationHistory />} />
          <Route path="/MyReferral" element={<MyReferral />} />
          <Route path="/LevelDetails" element={<LevelDetails />} />
          <Route path="/Downline" element={<Downline />} />
          <Route path="/VestingDirectIncome" element={<VestingDirectIncome />} />
          <Route path="/TradingIncome" element={<TradingIncome />} />
          <Route path="/LevelIncome" element={<LevelIncome />} />
          <Route path="/RoiLevelIncome" element={<RoiLevelIncome />} />
          <Route path="/WithdrawLevelIncome" element={<WithdrawLevelIncome />} />
          <Route path="/SalaryIncome" element={<SalaryIncome />} />
          <Route path="/ClaimSalary" element={<ClaimSalary />} />
          <Route path="/ClaimPool" element={<ClaimPool />} />
          <Route path="/PoolHistory" element={<PoolHistory />} />
          <Route path="/Withdrawal" element={<Withdrawal />} />
          <Route path="/WithdrawalHistory" element={<WithdrawalHistory />} />
          <Route path="/VestingHistory" element={<VestingHistory />} />
          <Route path="/ApproveSalary" element={<ApproveSalary />} />
          <Route path="/Trading" element={<Trading />} />
        </Routes>
      </Web3Listener>
    </>
  );
}

// Root app component with provider
function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;
