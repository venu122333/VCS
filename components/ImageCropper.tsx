import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
}

const getRadianAngle = (degreeValue: number) => {
  return (degreeValue * Math.PI) / 180;
};

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation: number = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Calculate bounding box of the rotated image
    const rotRad = getRadianAngle(rotation);
    const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
    const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) return '';

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // If the image is large, we might want to scale it down to ensure it stays within Firestore limits (e.g., 200x200 or 400x400)
    // For profile pics, 200x200 is usually plenty.
    const maxDimension = 300;
    if (croppedCanvas.width > maxDimension || croppedCanvas.height > maxDimension) {
      const scale = maxDimension / Math.max(croppedCanvas.width, croppedCanvas.height);
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = croppedCanvas.width * scale;
      scaledCanvas.height = croppedCanvas.height * scale;
      const scaledCtx = scaledCanvas.getContext('2d');
      if (scaledCtx) {
        scaledCtx.drawImage(croppedCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        return scaledCanvas.toDataURL('image/jpeg', 0.8);
      }
    }

    return croppedCanvas.toDataURL('image/jpeg', 0.8);
  };

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-slate-900 shadow-sm transition-all border border-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 space-y-8">
          <div className="relative h-64 bg-slate-50 rounded-3xl overflow-hidden shadow-inner border border-slate-100">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={onZoomChange}
              onRotationChange={setRotation}
              cropShape="rect"
              showGrid={false}
              classes={{
                containerClassName: "rounded-3xl",
                cropAreaClassName: "border-2 border-white shadow-lg rounded-[32px]"
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-4 px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest shrink-0 w-12">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest shrink-0 w-12">Rotate</span>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotate"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nudge Position</span>
                <div className="grid grid-cols-3 gap-2">
                  <div />
                  <button onClick={() => setCrop(c => ({ ...c, y: c.y + 20 }))} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 active:bg-slate-300 text-slate-600 flex justify-center items-center cursor-pointer transition-colors" title="Move Up">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <div />
                  <button onClick={() => setCrop(c => ({ ...c, x: c.x + 20 }))} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 active:bg-slate-300 text-slate-600 flex justify-center items-center cursor-pointer transition-colors" title="Move Left">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <div className="flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-bold">MOVE</span>
                  </div>
                  <button onClick={() => setCrop(c => ({ ...c, x: c.x - 20 }))} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 active:bg-slate-300 text-slate-600 flex justify-center items-center cursor-pointer transition-colors" title="Move Right">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <div />
                  <button onClick={() => setCrop(c => ({ ...c, y: c.y - 20 }))} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 active:bg-slate-300 text-slate-600 flex justify-center items-center cursor-pointer transition-colors" title="Move Down">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div />
                </div>
              </div>

            </div>

            <button
              onClick={handleCrop}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-3xl shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm"
            >
              Crop & Select
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageCropper;
