import React, { useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 border border-slate-700 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="modal-title" className="text-2xl font-bold text-white mb-4">
          Peraturan Lisensi
        </h2>

        <div className="text-slate-300 space-y-4">
          <p>
            Dengan membeli Anda setuju untuk mematuhi ketentuan lisensi berikut:
          </p>
          <ol className="list-decimal list-inside space-y-3 pl-2">
            <li>
              <strong>Hak Penggunaan</strong>
              <p className="pl-4 text-slate-400">
                Lisensi ini bersifat Personal Use Only (hanya untuk penggunaan pribadi). Anda berhak mengakses, menggunakan, dan menyimpan produk digital ini untuk kebutuhan pribadi.
              </p>
            </li>
            <li>
              <strong>Larangan</strong>
              <p className="pl-4 text-slate-400">
                Tidak boleh dijual kembali, didistribusikan ulang, atau dibagikan secara gratis maupun berbayar. Tidak boleh dimodifikasi lalu dijual kembali dalam bentuk apa pun.
              </p>
            </li>
            <li>
              <strong>Pelanggaran</strong>
              <p className="pl-4 text-slate-400">
                Jika ditemukan pelanggaran terhadap aturan lisensi ini, akses Anda dapat dicabut tanpa pengembalian dana.
              </p>
            </li>
          </ol>
          <div className="pt-4 border-t border-slate-700/50 text-left">
              <p className="font-semibold">Admin</p>
              <p className="text-slate-400">ProdukDigital.Net</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;
