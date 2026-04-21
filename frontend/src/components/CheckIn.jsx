import React, { useRef, useEffect, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

let modelsLoaded = false;

const CheckIn = ({ onCheckIn, onClose, user }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isRunningRef = useRef(false);   // ✅ ref so detection loop always reads fresh value
  const processingRef = useRef(false);  // ✅ ref instead of state to avoid stale closure

  const [status, setStatus] = useState("detecting"); // "detecting" | "success" | "fail"
  const [message, setMessage] = useState("Align your face 👀");

  // ─────────────────────────────────────────────
  // MODELS
  // ─────────────────────────────────────────────
  const loadModels = async () => {
    if (modelsLoaded) return;
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    modelsLoaded = true;
  };

  // ─────────────────────────────────────────────
  // CAMERA
  // ─────────────────────────────────────────────
  const startCamera = async () => {
    try {
      setMessage("Loading models... 🤖");
      await loadModels();

      setMessage("Starting camera... 📷");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(resolve);
        };
      });

      setMessage("Align your face 👀");
      isRunningRef.current = true;
      detectLoop();
    } catch (err) {
      console.error("Camera start error:", err);
      setStatus("fail");
      setMessage("❌ Camera failed. Please allow access.");
    }
  };

  const stopCamera = useCallback(() => {
    isRunningRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // ─────────────────────────────────────────────
  // MATCH
  // ─────────────────────────────────────────────
  const isMatch = useCallback(
    (desc) => {
      if (!user?.faceDescriptor) return false;
      const distance = faceapi.euclideanDistance(
        new Float32Array(desc),
        new Float32Array(user.faceDescriptor)
      );
      return distance < 0.5;
    },
    [user]
  );

  // ─────────────────────────────────────────────
  // CAPTURE
  // ─────────────────────────────────────────────
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg");
  };

  const getLocation = () =>
    new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 24.85811, lng: 67.205238 })
      );
    });

  // ─────────────────────────────────────────────
  // SUCCESS HANDLER
  // ─────────────────────────────────────────────
  const handleSuccess = async (desc) => {
    // Guard: don't run twice
    if (processingRef.current) return;
    processingRef.current = true;
    isRunningRef.current = false; // stop detection loop

    setStatus("success");
    setMessage("Face matched! ✅");

    try {
      const image = captureImage();
      const location = await getLocation();
      await onCheckIn(image, location, desc);

      setTimeout(() => {
        stopCamera();
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Check-in error:", err);
      setStatus("fail");
      setMessage("❌ Check-in failed. Try again.");
      processingRef.current = false;
    }
  };

  // ─────────────────────────────────────────────
  // DETECTION LOOP  (uses isRunningRef → no stale closure)
  // ─────────────────────────────────────────────
  const detectLoop = async () => {
    if (!isRunningRef.current || processingRef.current) return;

    const video = videoRef.current;
    if (!video || video.readyState !== 4) {
      setTimeout(detectLoop, 300);
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!isRunningRef.current) return; // stopped while awaiting

      if (detection) {
        const desc = Array.from(detection.descriptor);

        if (isMatch(desc)) {
          handleSuccess(desc);
          return; // exit loop — handleSuccess owns state from here
        } else {
          setStatus("fail");
          setMessage("❌ Face not recognized");

          await new Promise((r) => setTimeout(r, 1200));
          if (!isRunningRef.current) return;

          setStatus("detecting");
          setMessage("Align your face 👀");
        }
      } else {
        // No face — keep neutral
        if (status !== "detecting") {
          setStatus("detecting");
          setMessage("Align your face 👀");
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    // Schedule next frame
    if (isRunningRef.current) {
      setTimeout(() => requestAnimationFrame(detectLoop), 200);
    }
  };

  // ─────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────
  // BORDER / GLOW
  // ─────────────────────────────────────────────
  const borderClass =
    status === "success"
      ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.7)]"
      : status === "fail"
      ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.7)]"
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
          Face Check‑In
        </h2>
        <p className="text-sm text-gray-400 mb-6">{message}</p>

        {/* Circle camera */}
        <div className="flex justify-center">
          <div
            className={`relative w-64 h-64 rounded-full overflow-hidden border-4
                        transition-all duration-500 ${borderClass}`}
          >
            {/* Live feed */}
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
              {status === "detecting" && (
                <div className="w-44 h-44 border-2 border-white/60 rounded-full animate-ping opacity-60" />
              )}
              {status === "success" && (
                <>
                  <div className="w-full h-full bg-green-500/25 animate-ping" />
                  <span className="absolute text-5xl">✅</span>
                </>
              )}
              {status === "fail" && (
                <>
                  <div className="w-full h-full bg-red-500/25 animate-pulse" />
                  <span className="absolute text-5xl">❌</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hidden capture canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Cancel */}
        <button
          onClick={() => { stopCamera(); onClose(); }}
          className="mt-8 w-full bg-red-600 hover:bg-red-700 active:scale-95
                     text-white py-2.5 rounded-xl font-medium transition-all duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CheckIn;
