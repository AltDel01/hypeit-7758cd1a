// src/App.tsx

// 1. Tambahkan import yang diperlukan
import React, { useState, useEffect } from 'react'; // <-- Tambahkan useState, useEffect
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CustomErrorBoundary from "./components/error/ErrorBoundary";
import Index from "./pages/Index";
import BrandIdentity from "./pages/BrandIdentity";
import Virality from "./pages/Virality";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StableDiffusionPage from "./pages/StableDiffusionPage";

// Import komponen UI untuk pop-up hasil
import { Button } from '@/components/ui/button';
import { Copy, Download, X } from 'lucide-react';
import { toast } from "sonner";


const queryClient = new QueryClient();

// Komponen ProtectedRoute (tetap sama)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Komponen AuthRoute (tetap sama)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Komponen AppRoutes (tetap sama)
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomErrorBoundary><Index /></CustomErrorBoundary>} />
      <Route path="/brand-identity" element={<CustomErrorBoundary><BrandIdentity /></CustomErrorBoundary>} />
      <Route path="/virality" element={<CustomErrorBoundary><Virality /></CustomErrorBoundary>} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><CustomErrorBoundary><Dashboard /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route path="/inpainting" element={<CustomErrorBoundary><StableDiffusionPage /></CustomErrorBoundary>} />
      <Route
        path="/login"
        element={<AuthRoute><CustomErrorBoundary><Login /></CustomErrorBoundary></AuthRoute>}
      />
      <Route
        path="/signup"
        element={<AuthRoute><CustomErrorBoundary><Signup /></CustomErrorBoundary></AuthRoute>}
      />
      <Route path="*" element={<CustomErrorBoundary><NotFound /></CustomErrorBoundary>} />
    </Routes>
  );
};

// === Komponen Utama App ===
const App = () => {
  // --- State untuk gambar hasil dari event ---
  const [displayedImageUrl, setDisplayedImageUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false); // Kontrol visibilitas pop-up
  const IMAGE_EVENT_NAME = 'imageGenerated'; // Nama event (sesuaikan jika berbeda)

  // --- Effect untuk mendengarkan event global ---
  useEffect(() => {
    const handleImageGenerated = (event: Event) => {
      // Debugging: Log saat event diterima
      console.log("<<< App.tsx listener caught event >>>", event.detail);
      const customEvent = event as CustomEvent<{ imageUrl: string; prompt?: string }>;

      if (customEvent.detail && typeof customEvent.detail.imageUrl === 'string') {
        setDisplayedImageUrl(customEvent.detail.imageUrl);
        setIsVisible(true); // Tampilkan pop-up saat gambar valid diterima
      } else {
        // Log jika data event tidak sesuai harapan
        console.warn("<<< App.tsx listener: Invalid event detail received >>>", customEvent.detail);
      }
    };

    // Tambahkan listener saat App mount
    window.addEventListener(IMAGE_EVENT_NAME, handleImageGenerated);
    console.log("<<< App.tsx: Event listener for", IMAGE_EVENT_NAME, "added >>>");

    // Cleanup listener saat App unmount
    return () => {
      window.removeEventListener(IMAGE_EVENT_NAME, handleImageGenerated);
      console.log("<<< App.tsx: Event listener for", IMAGE_EVENT_NAME, "removed >>>");
    };
  }, []); // Array dependency kosong, hanya dijalankan sekali

  // --- Handler untuk UI Pop-up Hasil ---
  const handleClosePopup = () => {
    setIsVisible(false);
    // Optional: Hapus URL gambar saat ditutup agar tidak muncul lagi jika event sama terkirim?
    // setDisplayedImageUrl(null);
  };
  const handleDownloadPopup = () => {
     if (!displayedImageUrl) return;
    const a = document.createElement('a');
    a.href = displayedImageUrl;
    a.download = `generated-image.png`; // Nama file bisa dibuat lebih dinamis
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image downloaded");
  };
  const handleCopyPopup = () => {
    if (!displayedImageUrl) return;
    navigator.clipboard.writeText(displayedImageUrl)
      .then(() => toast.success("Image URL copied"))
      .catch(err => {
         console.error("Copy failed:", err);
         toast.error("Failed to copy URL");
      });
  };
  // --- Akhir Handler Pop-up ---


  // --- JSX Aplikasi Utama ---
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Toasters tetap di luar BrowserRouter agar bisa diakses dari mana saja */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CustomErrorBoundary>
              {/* AppRoutes merender halaman sesuai path */}
              <AppRoutes />

              {/* === Render Area Pop-up Hasil Generate === */}
              {/* Muncul secara kondisional berdasarkan state isVisible & displayedImageUrl */}
              {isVisible && displayedImageUrl && (
                <div
                  // Gunakan z-index tinggi agar tampil di atas konten lain
                  className="fixed bottom-4 right-4 z-[99] bg-white p-4 rounded-lg shadow-xl border border-gray-300 max-w-xs w-full animate-slide-in-bottom"
                  role="dialog" // Aksesibilitas
                  aria-modal="true"
                  aria-labelledby="popup-title"
                >
                  {/* Header Pop-up */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 id="popup-title" className="text-sm font-semibold text-gray-800">Generated Image</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100 rounded-full" onClick={handleClosePopup} aria-label="Close image preview">
                      <X size={16} />
                    </Button>
                  </div>
                  {/* Gambar Hasil */}
                  <div className="aspect-square overflow-hidden rounded-md mb-3 bg-gray-100 flex items-center justify-center">
                    <img
                      src={displayedImageUrl}
                      alt="Generated result" // Beri alt text yang deskriptif
                      className="max-w-full max-h-full object-contain"
                      // Tambahkan handler sederhana jika perlu debug load/error gambar ini
                      onLoad={() => console.log("App.tsx Popup: Image loaded.")}
                      onError={() => console.error("App.tsx Popup: Image failed to load.")}
                    />
                  </div>
                  {/* Tombol Aksi Pop-up */}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleCopyPopup}>
                      <Copy size={12} className="mr-1"/> Copy URL
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleDownloadPopup}>
                      <Download size={12} className="mr-1"/> Download
                    </Button>
                  </div>
                   {/* Pastikan style untuk animasi ada atau definisikan di global CSS */}
                   <style jsx>{`
                    @keyframes slide-in-bottom {
                      from { transform: translateY(100%); opacity: 0; }
                      to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slide-in-bottom {
                      animation: slide-in-bottom 0.3s ease-out forwards;
                    }
                  `}</style>
                </div>
              )}
              {/* ======================================= */}

            </CustomErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;