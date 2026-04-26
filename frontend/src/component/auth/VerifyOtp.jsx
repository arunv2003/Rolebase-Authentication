import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Signup.css";
import { authApi } from "../../router/auth/Signup";
import { toast } from "react-toastify";
import { useAppContext } from "../../contex/useAppContext";

const VerifyOTP = () => {
  const location = useLocation();
  const [data, setData] = useState({
    email: location.state?.email || "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const { setIsAuth, getUserData, setLoading: setGlobalLoading } = useAppContext();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!data.otp) {
      setError("Please enter the OTP");
      setLoading(false);
      return;
    }

    try {
      const result = await authApi.verifyOtp(data);
      if (result?.status==200) {
        setGlobalLoading(true);
        await getUserData();
        setIsAuth(true)
        toast.success(result.message || "OTP Verified Successfully!");
        navigate("/admin");
      } else {
        toast.error(result?.message || "Invalid OTP. Please try again.");
        setError(result?.message || "Invalid OTP");
      }
    } catch (err) {
      console.log(err);
      toast.error("An unexpected error occurred.");
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0 || loading) return;

    setLoading(true);
    try {
      const result = await authApi.resendOtp({ email: data.email });
      if (result?.status) {
        toast.success(result.message || "A new code has been sent!");
        setTimer(60); // Reset timer
      } else {
        toast.error(result?.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.log(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <header className="auth-header">
          <h1 className="auth-title">Verify Identity</h1>
          <p className="auth-subtitle">
            We've sent a code to{" "}
            <strong style={{ color: "var(--primary)" }}>{data.email}</strong>.
            Please enter it below.
          </p>
        </header>

        {error && (
          <div className="error-alert">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleOTP} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">One-Time Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </span>
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="Enter 6-digit code"
                value={data.otp}
                onChange={handleChange}
                style={{
                  letterSpacing: "4px",
                  textAlign: "center",
                  paddingLeft: "16px",
                }}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Verify & Continue"}
          </button>
        </form>

        <footer className="footer-text">
          Didn't receive the code?{" "}
          {timer > 0 ? (
            <span className="timer-text">
              Resend in <strong style={{ color: "var(--primary)" }}>{timer}s</strong>
            </span>
          ) : (
            <span
              className={`link ${loading ? "disabled" : ""}`}
              onClick={handleResendOTP}
            >
              Resend OTP
            </span>
          )}
        </footer>
      </div>
    </div>
  );
};

export default VerifyOTP;
