
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const PremiumFeatureModal: React.FC<PremiumFeatureModalProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-6xl w-full max-h-[95vh] overflow-y-auto md:py-12 px-1 sm:px-8">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold text-white text-center mt-2">Ingin Merasakan Sepenuhnya Spesialis Media Sosial AI Anda?</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 text-center">
            Pilih paket yang paling sesuai dengan kebutuhan Anda
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:gap-8 py-3 md:py-8 md:overflow-visible overflow-x-auto snap-x no-scrollbar">
          {/* Free Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <h3 className="text-xl font-semibold text-white mb-2">Gratis</h3>
            <div className="text-3xl font-bold text-white mb-4">Rp. 0</div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">Sempurna untuk mencoba fitur inti</p>
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              {["30 kredit per bulan","150 gambar / 1 video 720p","Generasi gambar & video AI","Chat AI untuk editing konten","3 penggunaan gratis per hari","Antrian tugas tanpa batas","Resolusi 720p video","Watermark pada hasil konten"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" disabled>Paket Saat Ini</Button>
          </div>

          {/* Starter Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-purple-500/30 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">Paling Populer</div>
            <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
            <div className="text-3xl font-bold text-white mb-4">Rp. 150.000,-<span className="text-lg text-gray-400">/bln</span></div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">Untuk brand dan bisnis yang berkembang</p>
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              {["660 kredit per bulan","3.300 gambar / 33 video 720p","Semua fitur Gratis","Generasi cepat (fast-track)","Generasi video 1080p","Image upscaling AI","Hapus watermark brand","Perpanjangan durasi video","Konten untuk penggunaan komersial"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-[#8c52ff] hover:bg-[#7a45e6] text-white" onClick={() => navigate('/pricing')}>Upgrade ke Starter</Button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <div className="text-3xl font-bold text-white mb-4">Rp. 250.000,-<span className="text-lg text-gray-400">/bln</span></div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">Untuk bisnis yang membutuhkan konversi tinggi</p>
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              {["3.000 kredit per bulan","15.000 gambar / 150 video 720p","Semua fitur Starter","Generasi cepat (fast-track)","Generasi video 1080p","Image upscaling AI","Hapus watermark brand","Perpanjangan durasi video","Akses prioritas fitur baru","Konten untuk penggunaan komersial"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#5ce1e6] hover:from-[#7a45e6] hover:to-[#4cbec3] text-white" onClick={() => navigate('/pricing')}>Upgrade ke Pro</Button>
          </div>

          {/* Specialist Plan */}
          <div className="relative p-4 md:p-6 rounded-xl border border-yellow-500/30 bg-gray-900/50 backdrop-blur-sm min-w-[85vw] md:min-w-0 snap-center">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold">Vibe Marketing</div>
            <h3 className="text-xl font-semibold text-white mb-2 pt-6 md:pt-0">Specialist</h3>
            <div className="text-3xl font-bold text-white mb-4">Rp. 1.250.000,-<span className="text-lg text-gray-400">/bln</span></div>
            <p className="text-sm text-gray-400 mb-4 md:mb-6">Pertumbuhan sosial dan analitik end-to-end berbasis AI</p>
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
              {["26.000 kredit per bulan","130.000 gambar / 1.300 video 720p","Semua fitur Pro","Generasi cepat (fast-track)","Generasi video 1080p","Image upscaling AI","Hapus watermark brand","Perpanjangan durasi video","Akses prioritas fitur baru","Undangan beta test (jika tersedia)","Posting otomatis AI ke media sosial","Analitik & pelaporan media sosial AI","Konten untuk penggunaan komersial"].map((f,i) => (
                <li key={i} className="flex items-start"><Check className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" /><span className="text-sm text-gray-300">{f}</span></li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#FEF7CD] hover:from-[#7a45e6] hover:to-[#FFE29F] text-gray-900 font-bold" onClick={() => navigate('/pricing')}>Upgrade ke Specialist</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeatureModal;
