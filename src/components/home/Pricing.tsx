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
        { name: "1 gambar branding per hari", included: true },
        { name: "3 gambar branding per bulan", included: true },
        { name: "10 konten teks per bulan", included: true },
        { name: "Gratis 1 halaman moodboard yang dihasilkan", included: true },
        { name: "Akses konsultasi dengan Ava", included: true },
      ],
      popular: false,
    },
    {
      title: "Starter",
      price: "Rp. 150.000,-",
      description: "Untuk brand dan bisnis yang berkembang",
      features: [
        { name: "15 gambar branding per bulan", included: true },
        { name: "25 konten teks per bulan", included: true },
        { name: "Logo Gratis yang Dihasilkan", included: true },
        { name: "Psikologi Warna Gratis", included: true },
        { name: "15 halaman paket identitas brand lengkap per bulan", included: true },
        { name: "Akses konsultasi dengan Ava", included: true },
      ],
      popular: true
    },
    {
      title: "Pro",
      price: "Rp. 250.000,-",
      description: "Untuk Bisnis yang Membutuhkan Konversi Tinggi",
      features: [
        { name: "25 gambar branding per bulan", included: true },
        { name: "40 konten teks per bulan", included: true },
        { name: "Logo Gratis yang Dihasilkan", included: true },
        { name: "Psikologi Warna Gratis", included: true },
        { name: "15 halaman paket identitas brand lengkap per bulan", included: true },
        { name: "Paket lengkap strategi viralitas", included: true },
        { name: "Analitik media sosial", included: true },
        { name: "Akses konsultasi dengan Ava", included: true },
      ],
      popular: false
    },
    {
      title: "Specialist",
      price: "Rp. 1.250.000,-",
      description: "Pertumbuhan sosial dan analitik end-to-end berbasis AI",
      features: [
        { name: "Semua Manfaat Pro", included: true },
        { name: "Posting otomatis AI ke media sosial", included: true },
        { name: "Analitik konten pemenang AI", included: true },
        { name: "Rekomendasi influencer dan analitik AI", included: true },
        { name: "Kontak AI, kumpulkan rate card, dan buat brief dengan influencer secara otomatis", included: true },
        { name: "Audit media sosial AI", included: true },
        { name: "Benchmarking kompetitor AI", included: true },
        { name: "Pelaporan media sosial AI", included: true },
        { name: "Analitik tren media sosial AI", included: true },
      ],
      popular: false,
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
                buttonText={
                  plan.title === "Gratis"
                    ? "Mulai Sekarang"
                    : plan.title === "Specialist"
                      ? "Upgrade ke Specialist"
                      : "Mulai Uji Coba Gratis"}
                className={
                  (plan.popular
                    ? "md:scale-105 md:shadow-lg z-10"
                    : "") + " duration-300"
                }
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
