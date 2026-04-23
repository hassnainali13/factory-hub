import { useState, useRef, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
const RESEND_COOLDOWN = 30; // seconds
const OTP_EXPIRY = 600;    // 10 minutes

export default function EmailVerification({ email, onVerified, onBack }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error'|'success'|'info', msg }

  // Resend cooldown timer
  const [resendSec, setResendSec] = useState(RESEND_COOLDOWN);
  const canResend = resendSec === 0;

  // OTP expiry timer
  const [otpSec, setOtpSec] = useState(OTP_EXPIRY);
  const otpExpired = otpSec === 0;

  const refs = useRef([]);

  // ── Resend cooldown countdown ──
  useEffect(() => {
    if (resendSec === 0) return;
    const t = setTimeout(() => setResendSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSec]);

  // ── OTP expiry countdown ──
  useEffect(() => {
    if (otpSec === 0) return;
    const t = setTimeout(() => setOtpSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpSec]);

  // ── Auto-clear alerts ──
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(t);
  }, [alert]);

  const fmtTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const getOtp = () => digits.join("");

  const handleChange = (val, idx) => {
    const clean = val.replace(/\D/, "");
    const updated = [...digits];
    updated[idx] = clean ? clean[0] : "";
    setDigits(updated);
    if (clean && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const updated = [...digits];
      updated[idx - 1] = "";
      setDigits(updated);
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = [...digits];
    text.split("").forEach((ch, i) => { updated[i] = ch; });
    setDigits(updated);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    if (otpExpired) {
      setAlert({ type: "error", msg: "Code has expired. Please request a new one." });
      return;
    }
    try {
      setLoading(true);
      setAlert(null);
      await axiosInstance.post("/auth/verify-otp", { email, otp: getOtp() });
      toast.success("Email verified successfully! Redirecting...");
      setTimeout(() => onVerified(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect code. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setDigits(["", "", "", "", "", ""]);
      setAlert(null);
      await axiosInstance.post("/auth/resend-otp", { email });
      setResendSec(RESEND_COOLDOWN);
      setOtpSec(OTP_EXPIRY);
      toast.info("A new code has been sent to your email.");
      refs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend code. Please try again.");
    }
  };

  const isFilled = getOtp().length === 6;

  // OTP timer color: green → amber (last 60s) → red (expired)
  const timerColor = otpExpired
    ? "text-red-500"
    : otpSec <= 60
    ? "text-amber-500"
    : "text-green-500";

  const alertStyles = {
    error:   "bg-red-50 border border-red-200 text-red-700",
    success: "bg-green-50 border border-green-200 text-green-700",
    info:    "bg-blue-50 border border-blue-200 text-blue-700",
  };

  const alertIcons = { error: "[!]", success: "[✓]", info: "[i]" };

  return (
    <div className="mt-6 space-y-4">

      {/* ── Alert Banner ── */}
      {alert && (
        <div className={`rounded-xl p-3 text-sm flex items-start gap-2 ${alertStyles[alert.type]}`}>
          <span className="font-mono text-xs mt-0.5 shrink-0">{alertIcons[alert.type]}</span>
          <span>{alert.msg}</span>
        </div>
      )}

      {/* ── OTP Expiry Timer ── */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${otpExpired ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
        <span className={`font-mono text-xs tracking-widest ${timerColor}`}>
          {otpExpired ? "CODE EXPIRED" : `EXPIRES IN ${fmtTime(otpSec)}`}
        </span>
      </div>

      {/* ── 6 OTP Blocks ── */}
      <div className="flex items-center justify-center gap-2">
        {digits.map((d, i) => (
          <>
            {i === 3 && (
              <span key="sep" className="text-blue-200 font-bold text-xl pb-1">—</span>
            )}
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className={`w-11 h-14 text-center text-xl font-bold font-mono rounded-xl border-2 outline-none transition-all
                ${alert?.type === "error" && isFilled
                  ? "border-red-400 bg-red-50 text-red-700"
                  : d
                  ? "border-blue-500 bg-white text-blue-900"
                  : "border-blue-200 bg-blue-50 text-blue-900"
                }
                focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100`}
            />
          </>
        ))}
      </div>

      {/* ── Verify Button ── */}
      <button
        onClick={handleVerify}
        disabled={!isFilled || loading || otpExpired}
        className="w-full rounded-xl bg-blue-700 text-white py-2.5 text-sm font-semibold disabled:bg-blue-300 transition-colors"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {/* ── Resend Button with countdown ── */}
      <button
        onClick={handleResend}
        disabled={!canResend}
        className="w-full rounded-xl bg-blue-50 border border-blue-200 text-blue-700 py-2.5 text-sm font-semibold disabled:text-blue-300 disabled:border-blue-100 transition-colors flex items-center justify-center gap-2"
      >
        Resend Code
        {!canResend && (
          <span className="font-mono text-xs text-blue-300">{resendSec}s</span>
        )}
      </button>

      {onBack && (
        <button onClick={onBack} className="w-full text-sm text-blue-600 underline">
          Back
        </button>
      )}
    </div>
  );
}