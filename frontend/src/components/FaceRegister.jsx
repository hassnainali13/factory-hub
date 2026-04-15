import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axiosInstance from "../api/axiosInstance";

const FaceRegister = ({ onRegisterSuccess, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const isRunningRef = useRef(false);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Loading AI models... 🤖");

  // ================= INIT =================
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
          video: { facingMode: "user" },
        });

        if (!mounted) return;

        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        await videoRef.current.play();

        startDetection();
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("❌ Camera / AI model failed");
      }
    };

    start();

    return () => {
      mounted = false;
      stopAll();
    };
  }, []);

  // ================= CLEANUP =================
  const stopAll = () => {
    isRunningRef.current = false;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
  };

  // ================= DETECTION =================
  const startDetection = () => {
    const video = videoRef.current;
    if (!video) return;

    setStatus("detecting");
    setMessage("Align your face 👀");

    isRunningRef.current = true;

    let successFrames = 0;

    timeoutRef.current = setTimeout(() => {
      if (isRunningRef.current) {
        isRunningRef.current = false;
        stopAll();
        setStatus("error");
        setMessage("❌ Face not detected properly");
      }
    }, 7000);

    intervalRef.current = setInterval(async () => {
      if (!video || video.readyState !== 4 || !isRunningRef.current) return;

      try {
        const result = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.6,
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!result) {
          successFrames = 0;
          return;
        }

        const { box } = result.detection;

        // SIZE CHECK
        const ratio =
          (box.width * box.height) /
          (video.videoWidth * video.videoHeight);

        if (ratio < 0.08) {
          setMessage("📏 Move closer");
          successFrames = 0;
          return;
        }

        if (ratio > 0.4) {
          setMessage("📏 Move back");
          successFrames = 0;
          return;
        }

        // CENTER CHECK
        const centerX = video.videoWidth / 2;
        const centerY = video.videoHeight / 2;

        const faceCenterX = box.x + box.width / 2;
        const faceCenterY = box.y + box.height / 2;

        if (
          Math.abs(centerX - faceCenterX) > 80 ||
          Math.abs(centerY - faceCenterY) > 80
        ) {
          setMessage("🎯 Center your face");
          successFrames = 0;
          return;
        }

        // STABILITY CHECK
        successFrames++;

        if (successFrames < 5) {
          setMessage("Hold still... 🤖");
          return;
        }

        // SUCCESS
        isRunningRef.current = false;

        clearInterval(intervalRef.current);
        clearTimeout(timeoutRef.current);

        setStatus("processing");
        setMessage("Processing... ⚡");

        await registerFace(result.descriptor);
      } catch (err) {
        console.error(err);
      }
    }, 200);
  };

  // ================= REGISTER =================
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
      console.error(err);
      setStatus("error");
      setMessage("❌ Server error");
    }
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-[360px] text-center shadow-2xl">

        <h2 className="text-xl font-bold mb-4">Face Register</h2>

        {/* 🔥 CAMERA CIRCLE */}
        <div className="relative flex justify-center items-center mt-4">

          <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-300">

            {/* VIDEO */}
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover scale-125"
            />

            {/* 🔥 DARK OVERLAY (focus effect) */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* 🔥 CLEAR CENTER (FACE AREA) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full backdrop-brightness-125 backdrop-blur-[1px]"></div>
            </div>

            {/* 🔥 GUIDE RING */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 border-2 border-dashed border-white/80 rounded-full"></div>
            </div>

            {/* 🔥 STATUS EFFECT INSIDE VIDEO */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

              {status === "detecting" && (
                <div className="w-40 h-40 border border-white/70 rounded-full animate-pulse"></div>
              )}

              {status === "processing" && (
                <div className="w-full h-full bg-blue-500/10 backdrop-blur-sm"></div>
              )}

              {status === "success" && (
                <div className="w-full h-full bg-green-500/20 animate-pulse"></div>
              )}

              {status === "error" && (
                <div className="w-full h-full bg-red-500/20 animate-pulse"></div>
              )}

            </div>

          </div>
        </div>

        {/* MESSAGE */}
        <p className="mt-4 text-sm text-gray-600">{message}</p>

        {/* BUTTON */}
        <button
          onClick={() => {
            stopAll();
            onClose?.();
          }}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default FaceRegister;