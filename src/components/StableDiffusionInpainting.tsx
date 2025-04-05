import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStableDiffusionInpainting } from '@/hooks/useStableDiffusionInpainting'; // Pastikan hook ini versi yg benar
import InpaintingForm from './stable-diffusion/InpaintingForm';
// import ResultPreview from './stable-diffusion/ResultPreview'; // <-- Komen atau hapus import jika tidak dipakai

// Import ikon jika perlu untuk loading indicator sederhana
import { Loader2 } from 'lucide-react';

// Komponen loading inline sederhana (opsional)
const SimpleLoadingIndicatorInline = () => (
  <div className="flex items-center justify-center text-sm text-indigo-600 space-x-2 p-4 border border-dashed border-indigo-200 rounded-md bg-indigo-50 min-h-[200px]">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Generating...</span>
  </div>
);


const StableDiffusionInpainting = () => {
  const { user } = useAuth();
  // Pastikan Anda menggunakan versi hook yang MENGELOLA isGenerating DENGAN BENAR
  const inpainting = useStableDiffusionInpainting();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* --- Kolom Input (TIDAK BERUBAH) --- */}
      <InpaintingForm
        // Props tetap sama seperti kode awal Anda
        isModelLoading={inpainting.isModelLoading}
        loadingStatus={inpainting.loadingStatus}
        loadingProgress={inpainting.loadingProgress}
        originalImage={inpainting.originalImage}
        setOriginalImage={inpainting.setOriginalImage}
        maskImage={inpainting.maskImage}
        setMaskImage={inpainting.setMaskImage}
        prompt={inpainting.prompt}
        setPrompt={inpainting.setPrompt}
        negativePrompt={inpainting.negativePrompt}
        setNegativePrompt={inpainting.setNegativePrompt}
        numInferenceSteps={inpainting.numInferenceSteps}
        setNumInferenceSteps={inpainting.setNumInferenceSteps}
        guidanceScale={inpainting.guidanceScale}
        setGuidanceScale={inpainting.setGuidanceScale}
        onGenerate={inpainting.generateInpaintedImage}
        isGenerating={inpainting.isGenerating} // Untuk disable tombol di form
        errorMessage={inpainting.errorMessage} // Untuk tampilkan error di form
        useWebhook={inpainting.useWebhook}
        setUseWebhook={inpainting.setUseWebhook}
      />

      {/* --- Kolom Hasil (Perubahan di sini) --- */}
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Result</h2>

          {/* === DIV BARU UNTUK HASIL LANGSUNG DARI HOOK === */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 min-h-[300px] flex items-center justify-center p-1 aspect-square max-h-[512px]">
            {/* 1. Tampilkan Loading jika isGenerating dari hook true */}
            {inpainting.isGenerating && (
              <SimpleLoadingIndicatorInline />
            )}

            {/* 2. Tampilkan Gambar jika TIDAK loading DAN resultImage dari hook ADA */}
            {!inpainting.isGenerating && inpainting.resultImage && (
              <img
                src={inpainting.resultImage}
                alt={inpainting.prompt || "Generated inpainting result"}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                onLoad={() => console.log("NEW DIV (Minimal): Image loaded.")}
                onError={() => console.error("NEW DIV (Minimal): Image failed to load.")}
              />
            )}

            {/* 3. Tampilkan Placeholder jika TIDAK loading dan TIDAK ada hasil */}
            {!inpainting.isGenerating && !inpainting.resultImage && (
              <div className="text-center text-gray-400 text-sm px-4">
                 Generated image will appear here.
              </div>
            )}
          </div>
          {/* === AKHIR DIV BARU === */}


          {/* === Komponen ResultPreview Lama (Dikomen/Dihapus) === */}
          {/* Baris ini menyebabkan masalah sebelumnya, jadi kita nonaktifkan */}
          {/*
          <ResultPreview
            resultImage={inpainting.resultImage}
            isLoading={inpainting.isGenerating}
            // Props ini mungkin tidak dikelola dengan benar oleh hook/webhook
            // dan menyebabkan masalah di dalam ResultPreview
            // loadingProgress={inpainting.loadingProgress}
            // generationTime={inpainting.generationTime}
          />
          */}
           {/* Jika Anda ingin menambahkan tombol Download/Copy, tambahkan di bawah div baru */}
            {!inpainting.isGenerating && inpainting.resultImage && (
                 <div className="flex space-x-2 mt-2 justify-end">
                      {/* ... Tombol Download/Copy ... */}
                 </div>
            )}

      </div> {/* Akhir Kolom Hasil */}
    </div> // Akhir Grid
  );
};

export default StableDiffusionInpainting;