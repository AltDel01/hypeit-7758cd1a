// src/hooks/useStableDiffusionInpainting.js (atau .ts)

import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
// Pastikan path service benar dan service ini HANYA punya sendImageToWebhook
// dan mungkin fungsi pembantu untuk webhook, BUKAN inpaint lokal.
import stableDiffusionService from '@/services/StableDiffusionService';

// --- Nama Event yang Harus Dipicu oleh Backend/Webhook Anda ---
// Pastikan nama dan struktur detail event ({ imageUrl: '...' }) konsisten
const RESULT_EVENT_NAME = 'stableDiffusionResultReady';
// ---

export function useStableDiffusionInpainting() {
  // == State untuk Input yang Dikirim ke Webhook ==
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null); // Jaga jika webhook perlu mask
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(25);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);

  // == State untuk Hasil dan Status ==
  const [resultImage, setResultImage] = useState<string | null>(null); // URL gambar hasil dari webhook
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // Status loading utama
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number>(0); // Untuk menghitung waktu (opsional)

  // == Fungsi untuk Mengirim Request ke Webhook ==
  const generateInpaintedImage = useCallback(async () => {
    // Validasi input minimal yang dibutuhkan oleh webhook Anda
    const missingItems = [];
    if (!originalImage) missingItems.push("original image");
    if (!maskImage) missingItems.push("mask image"); // Hapus jika webhook tidak pakai mask
    if (!prompt) missingItems.push("prompt");

    if (missingItems.length > 0) {
      const errorMsg = `Please provide: ${missingItems.join(", ")}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return; // Hentikan jika input tidak lengkap
    }

    // --- Memulai Proses ---
    setIsGenerating(true);
    setResultImage(null); // Hapus hasil sebelumnya
    setErrorMessage(null);
    setGenerationStartTime(Date.now());

    toast.info("Sending image generation request...");
    console.log("Sending request to webhook with prompt:", prompt);

    try {
      // Panggil fungsi service yang mengirim data ke webhook
      await stableDiffusionService.sendImageToWebhook({
        image: originalImage,
        mask: maskImage, // Kirim mask jika diperlukan webhook
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        // Tambahkan parameter lain jika webhook Anda membutuhkannya
      });

      console.log("Request successfully sent to webhook. Waiting for result event...");
      // JANGAN setIsGenerating(false) di sini. Kita menunggu event hasil.

    } catch (error) {
      // Tangani error jika PENGIRIMAN AWAL ke webhook gagal
      console.error("Error sending request to webhook:", error);
      const errorMsg = `Failed to send request: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsGenerating(false); // Hentikan loading karena request awal gagal
    }
    // Tidak ada `finally` yang mengontrol isGenerating di sini
    // Status loading akan dihentikan oleh event listener di bawah
  }, [
    originalImage,
    maskImage, // Tambahkan sebagai dependency jika digunakan
    prompt,
    negativePrompt,
    numInferenceSteps,
    guidanceScale
  ]); // Sertakan semua state input sebagai dependency

  // == Listener untuk Menerima Hasil dari Webhook via Custom Event ==
  useEffect(() => {
    const handleResultReady = (event: Event) => {
      // Pastikan event memiliki struktur yang diharapkan
      const customEvent = event as CustomEvent<{ imageUrl: string; [key: string]: any }>;

      if (customEvent.detail && typeof customEvent.detail.imageUrl === 'string') {
        console.log(`Received '${RESULT_EVENT_NAME}' event with image URL:`, customEvent.detail.imageUrl);

        // --- Hasil Diterima ---
        setResultImage(customEvent.detail.imageUrl);
        toast.success("Image generated successfully!");
        setIsGenerating(false); // <<< KUNCI: Hentikan Loading di Sini

      } else {
        console.warn(`Received '${RESULT_EVENT_NAME}' event, but the detail format is incorrect or missing imageUrl:`, customEvent.detail);
        // Opsional: Tangani jika data event tidak valid
        setErrorMessage("Received invalid result data from webhook.");
        toast.error("Received invalid result data.");
        setIsGenerating(false); // Hentikan loading meskipun data salah
      }
    };

    console.log(`Adding event listener for '${RESULT_EVENT_NAME}'`);
    window.addEventListener(RESULT_EVENT_NAME, handleResultReady);

    // Cleanup: Hapus listener saat komponen unmount atau hook tidak lagi digunakan
    return () => {
      console.log(`Removing event listener for '${RESULT_EVENT_NAME}'`);
      window.removeEventListener(RESULT_EVENT_NAME, handleResultReady);
    };
  }, []); // Array dependency kosong agar listener hanya ditambahkan/dihapus sekali

  // == Kalkulasi Waktu (Opsional) ==
  const generationTime = isGenerating && generationStartTime > 0
    ? Math.max(1, Math.floor((Date.now() - generationStartTime) / 1000))
    : null; // Tampilkan null atau 0 jika tidak sedang generate

  // == Nilai yang Dikembalikan oleh Hook ==
  return {
    // State Input
    originalImage,
    setOriginalImage,
    maskImage, // Kembalikan jika Anda masih membutuhkannya di UI
    setMaskImage, // Kembalikan jika Anda masih membutuhkannya di UI
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    numInferenceSteps,
    setNumInferenceSteps,
    guidanceScale,
    setGuidanceScale,

    // State Output & Status
    resultImage,
    isGenerating,
    errorMessage,
    generationTime, // Waktu berlalu (opsional)

    // Aksi Utama
    generateInpaintedImage,
  };
}