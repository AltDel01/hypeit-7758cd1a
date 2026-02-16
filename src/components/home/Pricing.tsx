import React from 'react';
import PricingCard from '@/components/ui/PricingCard';
import { cn } from '@/lib/utils';

const Pricing = () => {
  const pricing = [
    {
      title: "Gratis",
      price: "Rp. 0",
      description: "Sempurna untuk mencoba fitur inti",
      features: [
        { name: "30 kredit per bulan", included: true },
        { name: "150 gambar / 1 video 720p", included: true },
        { name: "Generasi gambar & video AI", included: true },
        { name: "Chat AI untuk editing konten", included: true },
        { name: "3 penggunaan gratis per hari", included: true },
        { name: "Antrian tugas tanpa batas", included: true },
        { name: "Resolusi 720p video", included: true },
        { name: "Watermark pada hasil konten", included: true },
      ],
      popular: false,
    },
    {
      title: "Starter",
      price: "Rp. 150.000,-",
      description: "Untuk brand dan bisnis yang berkembang",
      features: [
        { name: "660 kredit per bulan", included: true },
        { name: "3.300 gambar / 33 video 720p", included: true },
        { name: "Semua fitur Gratis", included: true },
        { name: "Generasi cepat (fast-track)", included: true },
        { name: "Generasi video 1080p", included: true },
        { name: "Image upscaling AI", included: true },
        { name: "Hapus watermark brand", included: true },
        { name: "Perpanjangan durasi video", included: true },
        { name: "Konten untuk penggunaan komersial", included: true },
      ],
      popular: true
    },
    {
      title: "Pro",
      price: "Rp. 250.000,-",
      description: "Untuk bisnis yang membutuhkan konversi tinggi",
      features: [
        { name: "3.000 kredit per bulan", included: true },
        { name: "15.000 gambar / 150 video 720p", included: true },
        { name: "Semua fitur Starter", included: true },
        { name: "Generasi cepat (fast-track)", included: true },
        { name: "Generasi video 1080p", included: true },
        { name: "Image upscaling AI", included: true },
        { name: "Hapus watermark brand", included: true },
        { name: "Perpanjangan durasi video", included: true },
        { name: "Akses prioritas fitur baru", included: true },
        { name: "Konten untuk penggunaan komersial", included: true },
      ],
      popular: false
    },
    {
      title: "Specialist",
      price: "Rp. 1.250.000,-",
      description: "Pertumbuhan sosial dan analitik end-to-end berbasis AI",
      features: [
        { name: "26.000 kredit per bulan", included: true },
        { name: "130.000 gambar / 1.300 video 720p", included: true },
        { name: "Semua fitur Pro", included: true },
        { name: "Generasi cepat (fast-track)", included: true },
        { name: "Generasi video 1080p", included: true },
        { name: "Image upscaling AI", included: true },
        { name: "Hapus watermark brand", included: true },
        { name: "Perpanjangan durasi video", included: true },
        { name: "Akses prioritas fitur baru", included: true },
        { name: "Undangan beta test (jika tersedia)", included: true },
        { name: "Posting otomatis AI ke media sosial", included: true },
        { name: "Analitik & pelaporan media sosial AI", included: true },
        { name: "Konten untuk penggunaan komersial", included: true },
      ],
      popular: false,
      isVibe: true,
      buttonText: "Upgrade ke Specialist"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Harga yang Sederhana dan Transparan
          </h2>
          <p className="text-brand-slate-600 text-md md:text-lg">
            Pilih paket yang tepat untuk bisnis Anda. Semua paket termasuk uji coba gratis 14 hari.
          </p>
        </div>
        
        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto snap-x md:overflow-visible pb-4 no-scrollbar">
          {pricing.map((plan, index) => (
            <div
              key={index}
              className="snap-start min-w-[85vw] max-w-xs sm:min-w-[60vw] md:min-w-0 md:max-w-none"
            >
              <PricingCard
                title={plan.title}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                isVibe={(plan as any).isVibe}
                buttonText={
                  plan.title === "Gratis"
                    ? "Paket Saat Ini"
                    : plan.title === "Starter"
                      ? "Upgrade ke Starter"
                      : plan.title === "Pro"
                        ? "Upgrade ke Pro"
                        : "Upgrade ke Specialist"}
                className="duration-300"
              />
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center text-brand-slate-500 text-sm px-2">
          Butuh paket khusus?{" "}
          <a href="#" className="text-brand-blue hover:underline">
            Hubungi kami
          </a>{" "}
          untuk harga enterprise.
        </div>
      </div>
    </section>
  );
};

export default Pricing;
