import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaEnvelope, FaShieldAlt, FaSyncAlt } from "react-icons/fa";

const OTPPopup = ({ email, onVerify, onClose, onResend, loading, error }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return false;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === 6) {
      onVerify(otpString);
    }
  };

  return (
    <div className="otp-overlay">
      <div className="otp-glass-card">
        <button className="otp-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="otp-header">
          <div className="otp-icon-wrapper pulse-animation">
            <FaShieldAlt />
          </div>
          <h2>Secure Verification</h2>
          <p>
            We've sent a 6-digit code to <br/>
            <span className="otp-email-highlight">{email}</span>
          </p>
        </div>

        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-input-container">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className={data ? "has-value" : ""}
                required
              />
            ))}
          </div>

          {error && (
            <div className="otp-error-container fade-in">
              <p className="otp-error-text">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            className={`otp-submit-btn ${loading ? 'loading' : ''}`} 
            disabled={loading || otp.join("").length < 6}
          >
            {loading ? (
              <span className="btn-content">
                <FaSyncAlt className="spin-icon" /> Verifying...
              </span>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        <div className="otp-footer">
          <p>Didn't get the code?</p>
          <button 
            className="resend-link" 
            disabled={timer > 0 || loading} 
            onClick={() => {
              setTimer(60);
              onResend();
            }}
          >
            {timer > 0 ? (
              <span>Resend available in <span className="timer-count">{timer}s</span></span>
            ) : (
              "Resend Code Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPPopup;
