import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
// Pastikan path service benar
import stableDiffusionService from '@/services/StableDiffusionService';

// Nama event yang diharapkan dari webhook
const RESULT_EVENT_NAME = 'stableDiffusionResultReady';

export function useStableDiffusionInpainting() {
  // == State untuk Input ==
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(25);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);

  // == State untuk Hasil dan Status ==
  const [resultImage, setResultImage] = useState<string | null>(null); // URL gambar hasil
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // Status loading yang AKURAT
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // == Fungsi Utama untuk Memulai Generate ==
  const generateInpaintedImage = useCallback(async () => {
    // Validasi input minimal
    const missingItems = [];
    if (!originalImage) missingItems.push("original image");
    if (!maskImage) missingItems.push("mask image"); // Sesuaikan jika mask tidak wajib
    if (!prompt) missingItems.push("prompt");

    if (missingItems.length > 0) {
      const errorMsg = `Please provide: ${missingItems.join(", ")}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return; // Hentikan jika input tidak lengkap
    }

    // --- Memulai Proses ---
    console.log("<<< HOOK: Starting generation process >>>");
    setIsGenerating(true); // <<< Mulai Loading
    setResultImage(null); // Hapus hasil sebelumnya
    setErrorMessage(null); // Hapus error sebelumnya

    toast.info("Sending image generation request...");
    console.log("Sending request to webhook with prompt:", prompt);

    try {
      // Panggil fungsi service yang mengirim data ke webhook
      // Asumsikan service ini HANYA mengirim, tidak menunggu response panjang
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
      // JANGAN setIsGenerating(false) di sini. Loading berhenti saat event diterima.

    } catch (error) {
      // Tangani error jika PENGIRIMAN AWAL ke webhook gagal
      console.error("Error sending request to webhook:", error);
      const errorMsg = `Failed to send request: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsGenerating(false); // <<< Hentikan Loading karena request awal gagal
    }
    // Tidak ada `finally` yang mengontrol isGenerating di sini
  }, [
    originalImage,
    maskImage,
    prompt,
    negativePrompt,
    numInferenceSteps,
    guidanceScale
  ]); // Sertakan semua state input sebagai dependency

  // == Listener untuk Menerima Hasil dari Webhook via Custom Event ==
  useEffect(() => {
    const handleResultReady = (event: Event) => {
      console.log("<<< HOOK: Event received:", RESULT_EVENT_NAME, event.detail);

      const customEvent = event as CustomEvent<{ imageUrl: string; [key: string]: any }>;

      // Validasi data event
      if (customEvent.detail && typeof customEvent.detail.imageUrl === 'string' && customEvent.detail.imageUrl) {
        console.log(`<<< HOOK: Valid imageUrl received: ${customEvent.detail.imageUrl.substring(0, 70)}... >>>`);
        setResultImage(customEvent.detail.imageUrl); // Simpan hasil
        setErrorMessage(null); // Hapus error jika sukses
        toast.success("Image generated successfully!");
      } else {
        // Data event tidak valid atau tidak ada imageUrl
        console.warn(`<<< HOOK: Received event, but detail incorrect or missing imageUrl >>>:`, customEvent.detail);
        setErrorMessage("Received invalid result data from webhook.");
        toast.error("Received invalid result data.");
        setResultImage(null); // Pastikan tidak ada gambar sisa jika data salah
      }

      // --- KUNCI: Hentikan Loading setelah event diproses (baik sukses maupun gagal data) ---
      console.log("<<< HOOK: Setting isGenerating to false (event processed) >>>");
      setIsGenerating(false);
    };

    // Tambahkan listener
    console.log(`<<< HOOK: Adding listener for ${RESULT_EVENT_NAME} >>>`);
    window.addEventListener(RESULT_EVENT_NAME, handleResultReady);

    // Cleanup: Hapus listener saat komponen unmount atau hook tidak lagi digunakan
    return () => {
      console.log(`<<< HOOK: Removing listener for ${RESULT_EVENT_NAME} >>>`);
      window.removeEventListener(RESULT_EVENT_NAME, handleResultReady);
    };
  }, []); // Array dependency kosong agar listener hanya ditambahkan/dihapus sekali

  // == Nilai yang Dikembalikan oleh Hook ==
  return {
    // State Input & Setters
    originalImage,
    setOriginalImage,
    maskImage,
    setMaskImage,
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    numInferenceSteps,
    setNumInferenceSteps,
    guidanceScale,
    setGuidanceScale,

    // State Output & Status
    resultImage,  // Berisi URL jika sukses
    isGenerating, // true jika proses berjalan, false jika selesai/error
    errorMessage, // Berisi pesan error jika ada

    // Aksi Utama
    generateInpaintedImage,
  };
}