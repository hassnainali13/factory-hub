import React, { useEffect, useRef } from "react";

const CheckIn = ({ onCheckIn, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    streamRef.current = stream;
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
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
    new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          res({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => rej()
      );
    });

  const handleSubmit = async () => {
    const image = captureImage();
    const location = await getLocation();

    onCheckIn(image, location);
    stopCamera();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <video ref={videoRef} autoPlay className="mb-3 rounded" />
      <canvas ref={canvasRef} className="hidden" />

      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 mr-2 rounded">
        Confirm
      </button>

      <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded">
        Cancel
      </button>
    </div>
  );
};

export default CheckIn;