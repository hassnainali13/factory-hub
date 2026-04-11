import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axiosInstance from "../api/axiosInstance";

const FaceRegister = ({ onRegisterSuccess, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const modelsLoaded = useRef(false);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Initializing AI...");
  const [progress, setProgress] = useState(0);

  // ================= LOAD MODELS =================
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        modelsLoaded.current = true;
        setStatus("ready");
        setMessage("Camera starting...");
      } catch (err) {
        setStatus("error");
        setMessage("Model loading failed ❌");
      }
    };

    loadModels();
  }, []);

  // ================= START CAMERA =================
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (!mounted) return;

        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          detectFace();
        };
      } catch (err) {
        setStatus("error");
        setMessage("Camera permission denied ❌");
      }
    };

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(intervalRef.current);
    };
  }, []);

  // ================= FACE DETECTION =================
  const detectFace = () => {
    if (!modelsLoaded.current) return;

    setStatus("detecting");
    setMessage("Align your face in frame 👀");

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;

      if (!video || video.readyState !== 4) return;

      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detection) {
        drawBox(detection);
        clearInterval(intervalRef.current);
        setTimeout(startCapture, 800);
      }
    }, 500);
  };

  // ================= DRAW FACE BOX =================
  const drawBox = (detection) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const dims = faceapi.matchDimensions(canvas, video, true);
    const resized = faceapi.resizeResults(detection, dims);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resized);
  };

  // ================= CAPTURE =================
  const startCapture = () => {
    setStatus("capturing");
    setMessage("Hold still... 📸");
    setProgress(0);

    const duration = 3000;
    const step = 50;
    const increment = 100 / (duration / step);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;

        if (next >= 100) {
          clearInterval(intervalRef.current);
          registerFace();
          return 100;
        }

        return next;
      });
    }, step);
  };

  // ================= REGISTER =================
  const registerFace = async () => {
    try {
      const video = videoRef.current;

      const result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result?.descriptor) throw new Error("Face not clear ❌");

      const descriptor = Array.from(result.descriptor);

      await axiosInstance.post("/attendance/register-face", {
        descriptor,
      });

      streamRef.current?.getTracks().forEach((t) => t.stop());

      setStatus("success");
      setMessage("Face Registered Successfully ✅");

      onRegisterSuccess(descriptor);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center">
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl p-6 rounded-2xl w-[420px]">

        <h2 className="text-center text-xl font-semibold mb-2">
          AI Face Registration
        </h2>

        {/* ================= VIDEO OR SUCCESS UI ================= */}
        <div className="relative">

          {status !== "success" ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full rounded-xl"
              />

              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
            </>
          ) : (
            // ================= SUCCESS ANIMATION =================
            <div className="flex flex-col items-center justify-center py-12">

              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">

                  <svg
                    className="w-14 h-14 text-green-600 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                </div>
              </div>

              <p className="mt-4 text-green-600 font-semibold text-lg animate-pulse">
                Face Registered Successfully
              </p>
            </div>
          )}

        </div>

        {/* ================= MESSAGE ================= */}
        {status !== "success" && (
          <p className="text-center mt-3 text-gray-700">
            {message}
          </p>
        )}

        {/* ================= PROGRESS BAR ================= */}
        {status === "capturing" && (
          <div className="h-2 bg-gray-200 mt-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ================= LOADING ================= */}
        {status === "loading" && (
          <div className="flex justify-center mt-3">
            <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* ================= BUTTONS ================= */}
        <div className="flex justify-between mt-5">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
          >
            Cancel
          </button>

          {status === "error" && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
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