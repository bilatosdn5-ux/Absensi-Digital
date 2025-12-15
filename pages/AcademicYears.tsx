
import React, { useState } from 'react';
import { useApp } from '../store';
import { Plus, Trash2, CheckCircle, Circle, Calendar, AlertTriangle } from 'lucide-react';

const AcademicYears: React.FC = () => {
  const { academicYears, addAcademicYear, setAcademicYear, deleteAcademicYear, triggerSave } = useApp();
  const [newYear, setNewYear] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'ACTIVATE' | 'DELETE', id: string } | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newYear.trim()) {
      addAcademicYear(newYear.trim());
      setNewYear('');
      triggerSave();
    }
  };

  const handleActivateClick = (id: string) => {
    setConfirmAction({ type: 'ACTIVATE', id });
  };

  const handleDeleteClick = (id: string) => {
    setConfirmAction({ type: 'DELETE', id });
  };

  const confirmActionHandler = () => {
    if (confirmAction?.type === 'ACTIVATE') {
        setAcademicYear(confirmAction.id);
        triggerSave();
    } else if (confirmAction?.type === 'DELETE') {
        deleteAcademicYear(confirmAction.id);
        triggerSave();
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
             <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Tahun Pelajaran</h1>
            <p className="text-sm text-gray-500">Atur periode akademik sekolah</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ADD FORM */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h3 className="font-bold text-gray-700 mb-4">Tambah Tahun Baru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tahun</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: 2025/2026"
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newYear}
                  onChange={e => setNewYear(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 font-medium"
              >
                <Plus size={18} /> Tambah
              </button>
            </form>
          </div>
        </div>

        {/* LIST */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4">Tahun Pelajaran</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {academicYears.map(year => (
                  <tr key={year.id} className={`hover:bg-gray-50 transition-colors ${year.isActive ? 'bg-indigo-50/50' : ''}`}>
                    <td className="p-4 font-bold text-gray-700">{year.name}</td>
                    <td className="p-4 text-center">
                      {year.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                           <Circle size={12} /> Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {!year.isActive && (
                          <button 
                            onClick={() => handleActivateClick(year.id)}
                            className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-200 transition-all hover:shadow-sm"
                            title="Aktifkan Tahun Ini"
                          >
                            Aktifkan
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleDeleteClick(year.id)}
                          disabled={year.isActive}
                          className={`p-2 rounded-full transition-colors ${year.isActive ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                          title={year.isActive ? "Tidak bisa menghapus tahun aktif" : "Hapus Tahun"}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full mb-4 ring-4 ${confirmAction.type === 'DELETE' ? 'bg-red-100 text-red-600 ring-red-50' : 'bg-green-100 text-green-600 ring-green-50'}`}>
                {confirmAction.type === 'DELETE' ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                 {confirmAction.type === 'DELETE' ? 'Hapus Tahun?' : 'Aktifkan Tahun?'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                 {confirmAction.type === 'DELETE' 
                   ? 'Data tahun pelajaran ini akan dihapus permanen.' 
                   : 'Data absensi akan mulai tercatat di tahun pelajaran yang baru ini.'}
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmActionHandler}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium shadow-lg transition-colors ${confirmAction.type === 'DELETE' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'}`}
                >
                  {confirmAction.type === 'DELETE' ? 'Ya, Hapus' : 'Ya, Aktifkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYears;
