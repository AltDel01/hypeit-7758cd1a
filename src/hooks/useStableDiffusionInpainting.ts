// src/hooks/useStableDiffusionInpainting.ts (DENGAN LOGGING)

import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
// Pastikan path service benar
import stableDiffusionService from '@/services/StableDiffusionService';

// Nama event yang diharapkan dari webhook (PASTIKAN SAMA PERSIS DENGAN YANG DIKIRIM)
const RESULT_EVENT_NAME = 'stableDiffusionResultReady';

export function useStableDiffusionInpainting() {
  // == State (Tetap sama seperti di kode hook awal Anda) ==
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(25);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // State loading utama
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Tambahkan state lain dari hook awal Anda jika memang ada dan digunakan
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false); // Contoh
  const [loadingStatus, setLoadingStatus] = useState<string>('');      // Contoh
  const [loadingProgress, setLoadingProgress] = useState<number>(0);    // Contoh
  const [generationTime, setGenerationTime] = useState<number | null>(null); // Contoh
  const [useWebhook, setUseWebhook] = useState<boolean>(true); // Contoh


  // == Fungsi Generate (Dengan Logging) ==
  const generateInpaintedImage = useCallback(async () => {
    // Validasi (tetap sama)
    const missingItems = [];
    if (!originalImage) missingItems.push("original image");
    if (!maskImage) missingItems.push("mask image");
    if (!prompt) missingItems.push("prompt");
    if (missingItems.length > 0) { /* ... handle error ... */ return; }

    // --- LOGGING START ---
    console.log('[HOOK LOG] ----- Generate Process START -----');
    console.log('[HOOK LOG] Setting isGenerating: true');
    setIsGenerating(true); // <<< PENTING: Mulai loading
    setResultImage(null);
    setErrorMessage(null);
    // Reset state lain jika perlu
    // setGenerationTime(null);

    toast.info("Sending generation request...");

    try {
      // Panggil service (tetap sama)
      await stableDiffusionService.sendImageToWebhook({
          image: originalImage, mask: maskImage, prompt, negative_prompt: negativePrompt, /*... lainnya*/
       });
      console.log('[HOOK LOG] Request sent to webhook. Waiting for event:', RESULT_EVENT_NAME);
      // JANGAN set isGenerating false di sini

    } catch (error) {
      console.error('[HOOK LOG] Error sending request:', error);
      const errorMsg = `Failed to send request: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      console.log('[HOOK LOG] Send Error! Setting isGenerating: false'); // <<< PENTING
      setIsGenerating(false); // <<< Hentikan loading jika pengiriman awal gagal
    }
     console.log('[HOOK LOG] ----- Generate Function END (waiting for event) -----');
  }, [
    originalImage, maskImage, prompt, negativePrompt, numInferenceSteps, guidanceScale // Tambah dependency jika ada state lain yg dipakai
  ]);

  // == Listener Event (Dengan Logging) ==
  useEffect(() => {
    const handleResultReady = (event: Event) => {
      // --- LOGGING EVENT ---
      console.log('[HOOK LOG] ***** Event Received! ***** Name:', event.type);
      console.log('[HOOK LOG] Event Detail:', event.detail);

      const customEvent = event as CustomEvent<{ imageUrl: string; [key: string]: any }>;

      // Proses event (tetap sama)
      if (customEvent.detail && typeof customEvent.detail.imageUrl === 'string' && customEvent.detail.imageUrl) {
        console.log('[HOOK LOG] Valid imageUrl found:', customEvent.detail.imageUrl.substring(0, 60) + '...');
        setResultImage(customEvent.detail.imageUrl);
        setErrorMessage(null);
        toast.success("Image generated!");
      } else {
        console.warn('[HOOK LOG] Invalid or missing imageUrl in event detail.');
        setErrorMessage("Received invalid result data.");
        toast.error("Received invalid result data.");
        setResultImage(null);
      }

      // --- LOGGING STOP ---
      console.log('[HOOK LOG] Event Processed. Setting isGenerating: false'); // <<< PENTING
      setIsGenerating(false); // <<< Hentikan loading SETELAH event diproses
    };

    // Pasang listener
    console.log(`[HOOK LOG] Adding listener for event: ${RESULT_EVENT_NAME}`);
    window.addEventListener(RESULT_EVENT_NAME, handleResultReady);

    // Cleanup listener
    return () => {
      console.log(`[HOOK LOG] Removing listener for event: ${RESULT_EVENT_NAME}`);
      window.removeEventListener(RESULT_EVENT_NAME, handleResultReady);
    };
  }, []); // Dependency kosong agar hanya jalan sekali

  // == Return Values (Sertakan semua yang dibutuhkan komponen anak) ==
  return {
    originalImage, setOriginalImage,
    maskImage, setMaskImage,
    prompt, setPrompt,
    negativePrompt, setNegativePrompt,
    numInferenceSteps, setNumInferenceSteps,
    guidanceScale, setGuidanceScale,
    resultImage,
    isGenerating, // State loading yang dikelola hook
    errorMessage,
    generateInpaintedImage,
    // Sertakan state lain dari hook awal Anda jika dibutuhkan oleh InpaintingForm atau ResultPreview
    isModelLoading, loadingStatus, loadingProgress, generationTime, useWebhook, setUseWebhook,
  };
}