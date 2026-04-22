import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

const ImageCropper = ({ image, onCropDone, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl w-[400px]">
        <div className="relative w-full h-[300px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom Slider */}
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
          className="w-full mt-3"
        />

        <div className="flex justify-between mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => onCropDone(croppedAreaPixels)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;