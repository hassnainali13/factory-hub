import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

let modelsLoaded = false;

const CheckIn = ({ onCheckIn, onClose, user }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("detecting");
  const [processing, setProcessing] = useState(false);

  // 🔥 load models once
  const loadModels = async () => {
    if (modelsLoaded) return;

    const MODEL_URL = "/models";

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
  };

  // 🔥 start camera
  const startCamera = async () => {
    await loadModels();

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;

    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      detectFace();
    };
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // 🔥 match face
  const isMatch = (desc) => {
    if (!user?.faceDescriptor) return false;

    const distance = faceapi.euclideanDistance(
      new Float32Array(desc),
      new Float32Array(user.faceDescriptor)
    );

    return distance < 0.5;
  };

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
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () =>
          resolve({ lat: 24.85811, lng: 67.205238 })
      );
    });

  // 🔥 SUCCESS
  const handleSuccess = async (desc) => {
    try {
      setProcessing(true);

      const image = captureImage();
      const location = await getLocation();

      await onCheckIn(image, location, desc);

      setStatus("success");

      setTimeout(() => {
        stopCamera();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus("fail");
    }
  };

  // 🔥 detection loop
  const detectFace = async () => {
    if (!videoRef.current || processing) return;

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const desc = Array.from(detection.descriptor);

        if (isMatch(desc)) {
          setStatus("success");
          handleSuccess(desc);
        } else {
          setStatus("fail");

          setTimeout(() => {
            setStatus("detecting");
            detectFace();
          }, 1200);

          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => requestAnimationFrame(detectFace), 300);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-6 w-[360px] text-center shadow-2xl">

        <h2 className="text-xl font-bold mb-4">Face Check-In</h2>

        {status === "detecting" && (
          <video ref={videoRef} autoPlay className="rounded-xl w-full h-64 object-cover" />
        )}

        {status === "success" && (
          <div className="text-green-500 text-6xl animate-bounce">✔</div>
        )}

        {status === "fail" && (
          <div className="text-red-500 text-6xl animate-pulse">✕</div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CheckIn;