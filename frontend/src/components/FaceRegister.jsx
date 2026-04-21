import React, { useRef, useEffect, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import axiosInstance from "../api/axiosInstance";

const FaceRegister = ({ onRegisterSuccess, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const isRunningRef = useRef(false);
  const successFramesRef = useRef(0); // ✅ ref so interval always reads latest count

  const [status, setStatus] = useState("loading");
  // "loading" | "detecting" | "processing" | "success" | "error"
  const [message, setMessage] = useState("Loading AI models... 🤖");

  // ─────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────
  const stopAll = useCallback(() => {
    isRunningRef.current = false;
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // ─────────────────────────────────────────────
  // CAMERA INIT  (called once on mount and again on retry)
  // ─────────────────────────────────────────────
  const initCamera = useCallback(async () => {
    // Reset state
    setStatus("loading");
    setMessage("Loading AI models... 🤖");
    successFramesRef.current = 0;

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);

      setMessage("Starting camera... 📷");

      // Stop any previous stream before opening a new one
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      startDetection();
    } catch (err) {
      console.error("Init error:", err);
      setStatus("error");
      setMessage("❌ Camera / AI model failed to load");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // DETECTION
  // ─────────────────────────────────────────────
  const startDetection = () => {
    const video = videoRef.current;
    if (!video) return;

    // Clear any previous detection loop
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    successFramesRef.current = 0;

    isRunningRef.current = true;
    setStatus("detecting");
    setMessage("Align your face 👀");

    // 12s hard timeout
    timeoutRef.current = setTimeout(() => {
      if (!isRunningRef.current) return;
      stopAll();
      setStatus("error");
      setMessage("❌ Face not detected. Try better lighting.");
    }, 12000);

    intervalRef.current = setInterval(async () => {
      if (!video || video.readyState !== 4 || !isRunningRef.current) return;

      try {
        const result = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.5,
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        // Check again — async gap
        if (!isRunningRef.current) return;

        if (!result) {
          successFramesRef.current = 0;
          setMessage("No face detected 👀");
          return;
        }

        const { box, score } = result.detection;

        if (score < 0.55) {
          successFramesRef.current = 0;
          setMessage("Face unclear, adjust lighting 💡");
          return;
        }

        const ratio = (box.width * box.height) / (video.videoWidth * video.videoHeight);

        if (ratio < 0.05) {
          successFramesRef.current = 0;
          setMessage("📏 Move closer to camera");
          return;
        }

        if (ratio > 0.45) {
          successFramesRef.current = 0;
          setMessage("📏 Move back a little");
          return;
        }

        const centerX = video.videoWidth / 2;
        const centerY = video.videoHeight / 2;
        const faceCenterX = box.x + box.width / 2;
        const faceCenterY = box.y + box.height / 2;
        const offsetX = Math.abs(centerX - faceCenterX);
        const offsetY = Math.abs(centerY - faceCenterY);

        if (offsetX > 60 || offsetY > 60) {
          successFramesRef.current = 0;
          const dir =
            faceCenterX < centerX - 60
              ? "🎯 Move right"
              : faceCenterX > centerX + 60
              ? "🎯 Move left"
              : faceCenterY < centerY - 60
              ? "🎯 Move down"
              : "🎯 Move up";
          setMessage(dir);
          return;
        }

        // Good frame
        successFramesRef.current += 1;
        const progress = Math.min(Math.round((successFramesRef.current / 8) * 100), 100);

        if (successFramesRef.current < 8) {
          setMessage(`Hold still... ${progress}% 🤖`);
          return;
        }

        // ✅ 8 good frames — register
        isRunningRef.current = false;
        clearInterval(intervalRef.current);
        clearTimeout(timeoutRef.current);

        setStatus("processing");
        setMessage("Processing... ⚡");

        await registerFace(result.descriptor);
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 200);
  };

  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────
  const registerFace = async (descriptor) => {
    try {
      await axiosInstance.post("/attendance/register-face", {
        descriptor: Array.from(descriptor),
      });

      stopAll();
      setStatus("success");
      setMessage("Face Registered Successfully ✅");

      setTimeout(() => {
        onRegisterSuccess?.(descriptor);
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error("Register error:", err);
      stopAll();
      setStatus("error");
      setMessage("❌ Server error. Please try again.");
    }
  };

  // ─────────────────────────────────────────────
  // RETRY  — re-opens camera properly
  // ─────────────────────────────────────────────
  const handleRetry = () => {
    stopAll();
    initCamera();
  };

  // ─────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────
  useEffect(() => {
    initCamera();
    return () => stopAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // BORDER
  // ─────────────────────────────────────────────
  const borderClass =
    status === "success"
      ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.7)]"
      : status === "error"
      ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.7)]"
      : status === "processing"
      ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.7)]"
      : "border-white/30";

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl p-8 w-[380px]
                   text-center shadow-2xl border border-white/10"
      >
        {/* Header */}
        <h2 className="text-xl font-semibold text-white tracking-wide mb-1">
          Face Register
        </h2>
        <p className="text-sm text-gray-400 mb-6 min-h-[20px] transition-all duration-200">
          {message}
        </p>

        {/* Circle camera */}
        <div className="flex justify-center">
          <div
            className={`relative w-64 h-64 rounded-full overflow-hidden border-4
                        transition-all duration-500 ${borderClass}`}
          >
            {/* Live video — mirrored */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Dashed guide ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-44 h-44 border-2 border-dashed border-white/40 rounded-full" />
            </div>

            {/* Status overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {(status === "detecting" || status === "loading") && (
                <div className="w-44 h-44 border-2 border-white/60 rounded-full animate-ping opacity-60" />
              )}
              {status === "processing" && (
                <div className="w-full h-full bg-blue-500/20 animate-pulse" />
              )}
              {status === "success" && (
                <>
                  <div className="w-full h-full bg-green-500/20 animate-ping" />
                  <span className="absolute text-5xl">✅</span>
                </>
              )}
              {status === "error" && (
                <>
                  <div className="w-full h-full bg-red-500/20 animate-pulse" />
                  <span className="absolute text-4xl">❌</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Retry on error */}
        {status === "error" && (
          <button
            onClick={handleRetry}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 active:scale-95
                       text-white py-2.5 rounded-xl font-medium transition-all duration-150"
          >
            Try Again
          </button>
        )}

        {/* Cancel */}
        <button
          onClick={() => { stopAll(); onClose?.(); }}
          className="mt-3 w-full bg-red-600 hover:bg-red-700 active:scale-95
                     text-white py-2.5 rounded-xl font-medium transition-all duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FaceRegister;
