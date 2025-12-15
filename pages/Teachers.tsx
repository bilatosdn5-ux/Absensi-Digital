
import React, { useState } from 'react';
import { useApp } from '../store';
import { Teacher } from '../types';
import { Plus, Trash2, Edit2, Upload, Save, X, AlertTriangle, BookOpen } from 'lucide-react';
import { CLASS_LIST } from '../constants';

const Teachers: React.FC = () => {
  const { teachers, subjects, addTeacher, updateTeacher, deleteTeacher, triggerSave } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  const initialForm: Teacher = {
    id: '', name: '', nip: '', classId: '', username: '', password: '', subjectIds: []
  };
  const [formData, setFormData] = useState<Teacher>(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateTeacher(formData);
    } else {
      addTeacher({ ...formData, id: Date.now().toString() });
    }
    triggerSave();
    setShowModal(false);
    setFormData(initialForm);
  };

  const handleEdit = (t: Teacher) => {
    setFormData({ ...t, subjectIds: t.subjectIds || [] });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setTeacherToDelete(id);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      deleteTeacher(teacherToDelete);
      triggerSave();
      setTeacherToDelete(null);
    }
  };

  const handleToggleSubject = (subjectId: string) => {
    const current = formData.subjectIds || [];
    if (current.includes(subjectId)) {
        setFormData({ ...formData, subjectIds: current.filter(s => s !== subjectId) });
    } else {
        setFormData({ ...formData, subjectIds: [...current, subjectId] });
    }
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;

  const handleImport = () => {
    if (!importText.trim()) return alert("Paste data excel dulu.");
    
    // Format: Name \t NIP \t ClassId
    const lines = importText.trim().split(/\r?\n/);
    const clean = (s: string) => s ? s.trim().replace(/^"|"$/g, '') : '';
    let count = 0;

    lines.forEach(line => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        addTeacher({
          id: Date.now().toString() + Math.random(),
          name: clean(parts[0]),
          nip: clean(parts[1]),
          classId: clean(parts[2]) || '',
          username: '',
          password: '',
          subjectIds: []
        });
        count++;
      }
    });

    if (count > 0) {
      alert(`Berhasil mengimport ${count} data guru.`);
      triggerSave();
      setImportText('');
      setShowImport(false);
    } else {
      alert("Gagal membaca format.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Data Guru & Wali Kelas</h1>
          <p className="text-sm text-gray-500">Kelola data pengajar, wali kelas, dan mata pelajaran yang diampu</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setFormData(initialForm); setIsEditing(false); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} /> Tambah Guru
          </button>
          <button 
            onClick={() => setShowImport(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Upload size={16} /> Import Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nama Guru</th>
              <th className="p-4">NIP</th>
              <th className="p-4">Wali Kelas</th>
              <th className="p-4">Mapel Diampu</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teachers.filter(t => t.id !== 'admin').map((t, idx) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{t.name}</td>
                <td className="p-4 text-gray-600">{t.nip}</td>
                <td className="p-4">
                  {t.classId ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Kelas {t.classId}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {t.subjectIds && t.subjectIds.length > 0 ? (
                      t.subjectIds.map(sid => (
                        <span key={sid} className="bg-orange-50 text-orange-700 border border-orange-100 text-[10px] px-2 py-0.5 rounded-full">
                          {getSubjectName(sid)}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic">Tidak ada</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(t)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(t.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-full">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teachers.filter(t => t.id !== 'admin').length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data guru.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {teacherToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full text-red-600 mb-4 ring-4 ring-red-50">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Guru?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Yakin ingin menghapus data guru ini?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setTeacherToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-500/30 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{isEditing ? 'Edit Guru' : 'Tambah Guru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" required 
                  className="w-full border p-2 rounded-lg"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                <input 
                  type="text" required 
                  className="w-full border p-2 rounded-lg"
                  value={formData.nip}
                  onChange={e => setFormData({...formData, nip: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas (Opsional)</label>
                <select 
                  className="w-full border p-2 rounded-lg bg-white"
                  value={formData.classId || ''}
                  onChange={e => setFormData({...formData, classId: e.target.value})}
                >
                  <option value="">-- Bukan Wali Kelas --</option>
                  {CLASS_LIST.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                </select>
              </div>
              
              {/* SUBJECT SELECTION */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                 <label className="block text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <BookOpen size={16}/> Mata Pelajaran yang Diampu
                 </label>
                 <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {subjects.map(s => (
                       <label key={s.id} className="flex items-center space-x-2 bg-white p-2 rounded border border-orange-200 cursor-pointer hover:bg-orange-100">
                          <input 
                            type="checkbox" 
                            checked={(formData.subjectIds || []).includes(s.id)}
                            onChange={() => handleToggleSubject(s.id)}
                            className="rounded text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium text-gray-700 truncate" title={s.name}>{s.name}</span>
                       </label>
                    ))}
                 </div>
                 {subjects.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada data mata pelajaran.</p>}
                 <p className="text-xs text-orange-600 mt-2">
                    Centang mata pelajaran agar nama guru ini muncul otomatis di Laporan Bulanan Mapel.
                 </p>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-4">
                Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Import dari Excel</h3>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Copy kolom: <strong>Nama</strong>, <strong>NIP</strong>, dan <strong>Kelas (Angka/Kosong)</strong> dari Excel.
            </p>
            <textarea 
              className="w-full h-40 border p-2 rounded text-sm font-mono mb-4" 
              placeholder={"Budi Santoso\t19800101...\t1\nSiti Aminah\t19850202...\t"}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <button onClick={handleImport} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              Proses Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
