import { BusinessInfo } from "./types";

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  product: "Biznet Home Samarinda",
  packages: [
    { speed: "50 Mbps", price: "Rp 250.000/bulan", description: "Home Internet 0D - Cocok untuk rumah tangga kecil" },
    { speed: "100 Mbps", price: "Rp 375.000/bulan", description: "Home Internet 1D - Streaming 4K & Work from Home lancar" },
    { speed: "200 Mbps", price: "Rp 575.000/bulan", description: "Home Internet 2D - Performa maksimal untuk gaming & smart home" },
  ],
  advantages: [
    "Jaringan The New Biznet Fiber",
    "Bandwidth Simetris (Upload = Download)",
    "Support Teknis Cepat & Profesional",
    "Tanpa FUP (Truly Unlimited)",
  ],
  promos: [
    "Promo Buy 3 Get 1 Month FREE",
    "Gratis Biaya Instalasi khusus wilayah Samarinda Kota",
  ],
  followUpScripts: [
    "Halo kak 👋 Menindaklanjuti obrolan kemarin seputar pemasangan Biznet Home di rumah. Apakah ada yang ingin ditanyakan lagi kak? Atau barangkali mau langsung dijadwalkan survey lokasinya? Kebetulan promo Buy 3 Get 1 masih berlaku lho 😊",
    "Semangat pagi kak! 🔥 Cuma mau mengingatkan kalau slot pemasangan di daerah kakak untuk besok masih tersedia. Mumpung ada promo gratis instalasi, sayang banget kalau dilewatkan. Bagaimana kak, mau diproses bookingnya sekarang?",
  ],
  coveredAreas: [
    "Samarinda Ulu",
    "Samarinda Ilir",
    "Samarinda Seberang",
    "Sambutan",
    "Sungai Kunjang",
    "Sungai Pinang",
    "Palaran",
    "Loa Janan Ilir",
    "Samarinda Kota",
  ],
  personality: {
    tone: 'natural',
    length: 'medium',
    useEmojis: true,
    forbiddenWords: ["tolong", "mohon maaf", "mungkin", "kurang tahu"],
    greeting: "Halo kak! 👋",
    closingStyle: "Ajak customer booking pemasangan atau cek coverage.",
    splitMessages: true,
    maxSentencesPerBubble: 1,
    typingDelayMode: 'normal',
    naturalPause: true
  },
  prompts: [
    {
      id: 'p-1',
      type: 'system',
      content: `Kamu adalah Biznet Home Samarinda Sales Admin. Kamu melayani calon pelanggan dengan ramah, komunikatif, dan menggunakan gaya bahasa orang Samarinda (native vibes) tapi tetap sopan. 
Hindari jawaban robotik. Jika pelanggan tanya area, sebutkan nama-nama jalan atau landmark di Samarinda untuk meyakinkan. 
Fokus utama: Ajak survey lokasi atau booking paket promo 3+1.`,
      version: 1,
      updatedAt: Date.now()
    },
    {
      id: 'p-2',
      type: 'sales',
      content: "Tawarkan paket 100 Mbps sebagai best-seller jika customer tidak menyebutkan kebutuhan spesifik.",
      version: 1,
      updatedAt: Date.now()
    },
    {
      id: 'p-3',
      type: 'complaint',
      content: "Tunjukkan empati tinggi, jelaskan sedang ada pemeliharaan jaringan (jika relevan) dan arahkan ke nomor teknisi pusat.",
      version: 1,
      updatedAt: Date.now()
    }
  ],
  rules: [
    {
      id: 'r-1',
      condition: "Customer tanya harga",
      action: "Tampilkan tabel harga paket Biznet Home + promo Buy 3 Get 1."
    },
    {
      id: 'r-2',
      condition: "Customer menyebutkan alamat/lokasi",
      action: "Cek coverage area dan tawarkan survey lokasi gratis hari ini."
    }
  ]
};
