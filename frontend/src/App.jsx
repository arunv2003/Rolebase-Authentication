import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import Signup from "./component/auth/Signup";
import SignIn from "./component/auth/Login";
import AdminDashboard from "./component/Home/Admin/AdminDashboard";
import VerifyOTP from "./component/auth/VerifyOtp";
import { useAppContext } from "./contex/useAppContext";

const ProtectedRoute = ({ children, isAuth }) => {
  console.log(children,"isAuthisAuthisAuthProtectedRoute")
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { isAuth, loading } = useAppContext();

  console.log(isAuth,"isAuthisAuthisAuth")

  if (loading) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        <Route path="/sign-up" element={isAuth ? <Navigate to="/admin" /> : <Signup />} />
        <Route path="/" element={isAuth ? <Navigate to="/admin" /> : <SignIn />} />
        <Route path="/admin" element={
          <ProtectedRoute isAuth={isAuth}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/verify-otp" element={isAuth ? <Navigate to="/admin" /> : <VerifyOTP />} />
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to={isAuth ? "/admin" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
