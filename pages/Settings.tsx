
import React from 'react';
import { useApp } from '../store';
import { Cloud, CheckCircle, Database, AlertTriangle, ExternalLink } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';

const Settings: React.FC = () => {
  const { lastSync, firebaseConfigError } = useApp();
  const isConfigured = isFirebaseConfigured();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600">
           <Database size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Database & Koneksi</h1>
          <p className="text-sm text-gray-500">Status koneksi Firebase Realtime Database</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Cloud size={20} className={isConfigured ? "text-green-500" : "text-red-500"} />
              Status Sistem
            </h2>
            
            {!isConfigured ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 mb-6">
                    <AlertTriangle className="text-red-600 mt-1 shrink-0" size={24} />
                    <div>
                        <p className="font-bold text-red-800 text-lg">Firebase Belum Dikonfigurasi!</p>
                        <p className="text-red-700 mt-2">
                            Aplikasi ini belum terhubung ke database. Data tidak akan tersimpan.
                        </p>
                        <div className="mt-4 bg-white p-4 rounded border border-red-200 text-sm font-mono text-gray-600">
                           Buka file <strong>src/firebase.ts</strong> dan isi <code>firebaseConfig</code> dengan API Key dari Firebase Console Anda.
                        </div>
                        <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-blue-600 font-bold hover:underline">
                           Buka Firebase Console <ExternalLink size={16}/>
                        </a>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                    <CheckCircle className="text-green-600 mt-1 shrink-0" size={20} />
                    <div>
                        <p className="font-bold text-green-800">Terhubung ke Firebase Firestore</p>
                        <p className="text-sm text-green-700 mt-1">
                            Semua perubahan data disimpan secara otomatis dan Realtime (Langsung) ke server Google.
                        </p>
                    </div>
                </div>
            )}

            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center px-8">
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Mode Database</p>
                    <p className="text-lg font-bold text-blue-600">Firestore</p>
                 </div>
                 <div className="h-8 w-px bg-gray-300"></div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status Sinkronisasi</p>
                    <p className="text-lg font-bold text-green-600">Otomatis</p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
