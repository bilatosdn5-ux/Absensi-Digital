
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { User, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { INITIAL_HEADMASTER } from '../constants';

const Headmaster: React.FC = () => {
  const { headmaster, updateHeadmaster, triggerSave } = useApp();
  const [name, setName] = useState(headmaster.name);
  const [nip, setNip] = useState(headmaster.nip);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setName(headmaster.name);
    setNip(headmaster.nip);
  }, [headmaster]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeadmaster({ name, nip });
    triggerSave();
    alert("Data Kepala Sekolah berhasil diperbarui.");
  };

  const confirmReset = () => {
      updateHeadmaster(INITIAL_HEADMASTER);
      setName(INITIAL_HEADMASTER.name);
      setNip(INITIAL_HEADMASTER.nip);
      triggerSave();
      setShowResetConfirm(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Data Kepala Sekolah</h1>
        <p className="text-gray-500">Atur informasi kepala sekolah untuk tanda tangan laporan</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-4 border-white shadow-lg">
            <User size={48} />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap & Gelar</label>
            <input 
              type="text" required 
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
            <input 
              type="text" required 
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={nip}
              onChange={e => setNip(e.target.value)}
              placeholder="19xxxxxxxx xxx x xxx"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                title="Kembalikan nama kepala sekolah bawaan"
             >
                <RotateCcw size={20} /> Reset Default
             </button>
            <button 
              type="submit" 
              className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Save size={20} /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 mb-4 ring-4 ring-yellow-50">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Reset Data?</h3>
              <p className="text-sm text-gray-500 mb-6">
                 Kembalikan data kepala sekolah ke default sistem (bawaan)?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmReset}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition-colors"
                >
                  Ya, Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Headmaster;
