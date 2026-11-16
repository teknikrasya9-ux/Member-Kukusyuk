import React from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAgree }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-gray-900 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Syarat dan Ketentuan menjadi VIP-Membership
              </h3>
              <p className="text-xs text-gray-500">
                Kukusyuk: CampusFit • Harap baca dengan saksama
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2 sm:pr-4 py-4 space-y-5 text-xs sm:text-sm text-gray-700 leading-relaxed custom-scrollbar">
          {/* Section 1 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-extrabold">1</span>
              <span>Kelayakan &amp; Pendaftaran Akun</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                <strong className="text-gray-800">Keakuratan Data:</strong> Pengguna wajib mengisi data identitas secara benar dan dapat dipertanggungjawabkan, meliputi nama lengkap, alamat email aktif, nomor WhatsApp (+62), serta status pekerjaan saat melakukan registrasi maupun pengisian formulir pembayaran.
              </li>
              <li>
                <strong className="text-gray-800">Kepemilikan Akun Tunggal:</strong> Satu akun hanya diperuntukkan bagi satu individu. Pengguna bertanggung jawab penuh menjaga kerahasiaan kata sandi (password) dan kode verifikasi OTP yang dikirimkan ke email atau akun Google terdaftar.
              </li>
              <li>
                <strong className="text-gray-800">Larangan Berbagi Akun (Account Sharing):</strong> Pengguna dilarang keras meminjamkan, menyewakan, atau memperjualbelikan akses akun VIP kepada pihak lain.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-extrabold">2</span>
              <span>Biaya Keanggotaan, Pembayaran &amp; Kode Promo</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                <strong className="text-gray-800">Tarif Resmi:</strong> Biaya keanggotaan VIP Member Kuksyuk-CampusFit ditetapkan sebesar Rp60.000 per periode langganan yang berlaku.
              </li>
              <li>
                <strong className="text-gray-800">Penggunaan Kode Promo:</strong> Pengguna berhak mendapatkan potongan harga menjadi Rp50.000 apabila memasukkan kode promo resmi yang diperoleh langsung melalui komunikasi dengan Admin Kuksyuk-CampusFit. Kode promo tidak dapat diuangkan dan hanya berlaku satu kali per transaksi.
              </li>
              <li>
                <strong className="text-gray-800">Ketepatan Nominal Transfer:</strong> Pembayaran dilakukan melalui metode QRIS yang tersedia pada halaman pembayaran. Pengguna wajib mentransfer sesuai dengan nominal akhir yang tertera pada layar status pembayaran (Rp50.000 jika memakai kode promo valid, atau Rp60.000 tanpa kode promo).
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-extrabold">3</span>
              <span>Verifikasi &amp; Aktivasi Status VIP</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                <strong className="text-gray-800">Proses Konfirmasi Manual:</strong> Setelah mengirimkan formulir pembayaran dan bukti transaksi, status akun akan berada pada tahap Menunggu Konfirmasi. Admin akan memverifikasi mutasi dana masuk dan validitas kode promo maksimal dalam waktu 1x24 jam setelah transaksi dikirimkan.
              </li>
              <li>
                <strong className="text-gray-800">Penolakan Transaksi:</strong> Admin berhak menolak pengajuan VIP apabila dana tidak ditemukan pada mutasi rekening, nominal transfer kurang dari tagihan, atau bukti pembayaran terindikasi palsu/hasil rekayasa.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-extrabold">4</span>
              <span>Kebijakan Pengembalian Dana (Refund)</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                <strong className="text-gray-800">Non-Refundable:</strong> Biaya keanggotaan yang telah dibayarkan dan berhasil diverifikasi menjadi status VIP Member tidak dapat dibatalkan maupun dikembalikan (non-refundable) dengan alasan apa pun.
              </li>
              <li>
                <strong className="text-gray-800">Pengecualian:</strong> Pengembalian dana hanya diproses apabila terbukti terjadi kesalahan teknis sistem atau transfer ganda (double payment) dengan melampirkan bukti mutasi resmi kepada Admin.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-extrabold">5</span>
              <span>Hak Kekayaan Intelektual &amp; Batasan Penggunaan</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                <strong className="text-gray-800">Penggunaan Pribadi:</strong> Seluruh fitur premium, materi, panduan, maupun layanan eksklusif di dalam ekosistem Kuksyuk-CampusFit dilindungi hak cipta dan hanya boleh digunakan untuk keperluan pribadi pengguna.
              </li>
              <li>
                <strong className="text-gray-800">Larangan Distribusi Ulang:</strong> Pengguna dilarang menyalin, mengunduh massal (scraping), memodifikasi, atau menyebarluaskan konten dan fitur premium ke pihak ketiga tanpa izin tertulis dari pengelola Kuksyuk-CampusFit.
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-extrabold">6</span>
              <span>Pelanggaran &amp; Pencabutan Status VIP</span>
            </h4>
            <p className="pl-2 text-gray-600">
              Pengelola berhak membekukan akun dan mencabut status VIP Member secara sepihak tanpa pengembalian dana apabila pengguna terbukti melakukan tindakan kecurangan—termasuk manipulasi data pembayaran, penyalahgunaan celah sistem, pengiriman spam transaksi, atau pelanggaran terhadap aturan berbagi akun.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-extrabold">7</span>
              <span>Perubahan Ketentuan &amp; Layanan Bantuan</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              <li>
                Pengelola Kuksyuk-CampusFit berhak memperbarui harga paket, manfaat fitur VIP, maupun isi Syarat dan Ketentuan ini sewaktu-waktu untuk peningkatan kualitas layanan.
              </li>
              <li>
                Pertanyaan terkait kendala pembayaran, permintaan kode promo, atau pelaporan masalah akun dapat disampaikan langsung melalui tombol Chat Admin yang tersedia di halaman website.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onAgree}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Saya Mengerti &amp; Setuju</span>
          </button>
        </div>
      </div>
    </div>
  );
};

