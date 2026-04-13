// frontend/src/components/FaceRegister.jsx
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axiosInstance from "../api/axiosInstance";

const FaceRegister = ({ onRegisterSuccess, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const detectionActive = useRef(false);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Loading AI models... 🤖");

  // ================= LOAD MODELS + CAMERA =================
  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        if (!mounted) return;

        setMessage("Starting camera... 📷");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: "user" },
        });

        if (!mounted) return;

        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        await videoRef.current.play();

        startDetection();
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("❌ Camera / AI model load failed");
      }
    };

    start();

    return () => {
      mounted = false;
      stopEverything();
    };
  }, []);

  // ================= CLEANUP =================
  const stopEverything = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    clearTimeout(closeTimeoutRef.current);
    detectionActive.current = false;
  };

  // ================= DETECTION =================
  const startDetection = async () => {
    const video = videoRef.current;
    if (!video) return;

    setStatus("detecting");
    setMessage("Align your face 👀 (max 5 sec)");

    detectionActive.current = true;

    let detected = false;

    timeoutRef.current = setTimeout(() => {
      if (!detected) {
        stopEverything();
        setStatus("error");
        setMessage("❌ Face not detected, try better lighting");
      }
    }, 5000);

    intervalRef.current = setInterval(async () => {
      if (!video || video.readyState !== 4 || !detectionActive.current) return;

      const result = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (result && !detected) {
        detected = true;
        detectionActive.current = false;

        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);

        setStatus("processing");
        setMessage("Processing face data... ⚡");

        await registerFace(result.descriptor);
      }
    }, 200);
  };

  // ================= REGISTER FACE =================
  const registerFace = async (descriptor) => {
    try {
      await axiosInstance.post("/attendance/register-face", {
        descriptor: Array.from(descriptor),
      });

      stopEverything();

      setStatus("success");
      setMessage("Face Registered Successfully ✅");

      // ================= AUTO CLOSE AFTER 3 SEC (NO RELOAD) =================
      closeTimeoutRef.current = setTimeout(() => {
        onRegisterSuccess?.(descriptor); // update parent UI
        onClose?.(); // close modal
      }, 3000);

    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(
        err?.response?.data?.message || "❌ Server error while registering face"
      );
    }
  };

  // ================= VIDEO READY =================
  const handleVideoPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    faceapi.matchDimensions(canvas, {
      width: video.videoWidth,
      height: video.videoHeight,
    });
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6">

        {/* Title */}
        <h2 className="text-center text-xl font-bold text-gray-800">
          AI Face Registration
        </h2>

        {/* Status */}
        <div className="text-center mt-2">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
            {status.toUpperCase()}
          </span>
        </div>

        {/* VIDEO / SUCCESS */}
        <div className="relative mt-4 rounded-xl overflow-hidden bg-black">

          {status !== "success" ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                onPlay={handleVideoPlay}
                className="w-full rounded-xl"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white">

              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <p className="mt-4 text-green-600 font-semibold text-lg">
                Success!
              </p>

              <p className="text-gray-500 text-sm mt-1">
                Closing automatically...
              </p>
            </div>
          )}
        </div>

        {/* MESSAGE */}
        {status !== "success" && (
          <p className="text-center mt-4 text-gray-700 text-sm">
            {message}
          </p>
        )}

        {/* BUTTONS */}
        <div className="flex justify-between mt-5">

          <button
            onClick={() => {
              stopEverything();
              onClose?.();
            }}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>

          {status === "error" && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default FaceRegister;