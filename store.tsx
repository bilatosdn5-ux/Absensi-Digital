
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppState, Student, Teacher, AttendanceRecord, AcademicYear, 
  Holiday, Headmaster, UserRole, Alumni, AlumniReason, AttendanceStatus,
  Subject, SubjectAttendanceRecord
} from './types';
import { 
  INITIAL_TEACHERS, INITIAL_YEARS, INITIAL_HOLIDAYS, INITIAL_HEADMASTER, DEFAULT_SCRIPT_URL
} from './constants';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, updateDoc, query, where 
} from 'firebase/firestore';

interface AppContextType extends AppState {
  login: (role: UserRole, data?: any) => void;
  logout: () => void;
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  promoteStudent: (id: string, newClassId: string, newYearId: string) => void;
  moveToAlumni: (studentId: string, reason: AlumniReason, date: string) => void;
  markAttendance: (records: AttendanceRecord[]) => void;
  updateHeadmaster: (h: Headmaster) => void;
  addTeacher: (t: Teacher) => void;
  updateTeacher: (t: Teacher) => void;
  deleteTeacher: (id: string) => void;
  setAcademicYear: (id: string) => void;
  addAcademicYear: (name: string) => void;
  deleteAcademicYear: (id: string) => void;
  toggleHoliday: (h: Holiday) => void;
  deleteHoliday: (id: string) => void;
  
  addSubject: (s: Subject) => void;
  updateSubject: (s: Subject) => void;
  deleteSubject: (id: string) => void;
  markSubjectAttendance: (records: SubjectAttendanceRecord[]) => void;
  
  // Legacy props kept for compatibility
  setGoogleScriptUrl: (url: string) => void;
  syncToCloud: (silent?: boolean) => Promise<boolean>;
  syncFromCloud: () => Promise<boolean>;
  triggerSave: () => void; 
  firebaseConfigError: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Definitions
  const [students, setStudents] = useState<Student[]>([]);
  // Initialize with empty array to avoid flash of fake content before DB sync
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [headmaster, setHeadmaster] = useState<Headmaster>(INITIAL_HEADMASTER);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendanceRecord[]>([]);
  
  const [currentUser, setCurrentUser] = useState<AppState['currentUser']>(null);
  const [firebaseConfigError, setFirebaseConfigError] = useState(false);
  
  // Legacy states
  const [googleScriptUrl, setGoogleScriptUrl] = useState<string>(DEFAULT_SCRIPT_URL);
  const [lastSync, setLastSync] = useState<string>('Realtime (Firebase)');
  const [isSyncing, setIsSyncing] = useState(false);

  // --- FIREBASE REALTIME LISTENERS ---
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseConfigError(true);
      return;
    }

    // 1. Students Listener
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
       const data = snap.docs.map(doc => doc.data() as Student);
       setStudents(data);
    });

    // 2. Teachers Listener with Auto-Seed
    const unsubTeachers = onSnapshot(collection(db, "teachers"), (snap) => {
       const data = snap.docs.map(doc => doc.data() as Teacher);
       if (data.length === 0) {
         // Seed Initial Teachers (Admin) if DB is empty
         const batch = writeBatch(db);
         INITIAL_TEACHERS.forEach(t => {
             batch.set(doc(db, "teachers", t.id), t);
         });
         batch.commit().catch(console.error);
       } else {
         setTeachers(data);
       }
    });

    // 3. Attendance Listener
    const unsubAttendance = onSnapshot(collection(db, "attendance"), (snap) => {
       const data = snap.docs.map(doc => doc.data() as AttendanceRecord);
       setAttendance(data);
    });

    // 4. Academic Years with Auto-Seed
    const unsubYears = onSnapshot(collection(db, "academicYears"), (snap) => {
       const data = snap.docs.map(doc => doc.data() as AcademicYear);
       if (data.length === 0) {
         const batch = writeBatch(db);
         INITIAL_YEARS.forEach(y => {
             batch.set(doc(db, "academicYears", y.id), y);
         });
         batch.commit().catch(console.error);
       } else {
         setAcademicYears(data);
       }
    });

    // 5. Holidays with Auto-Seed
    const unsubHolidays = onSnapshot(collection(db, "holidays"), (snap) => {
       const data = snap.docs.map(doc => doc.data() as Holiday);
       if (data.length === 0) {
          const batch = writeBatch(db);
          INITIAL_HOLIDAYS.forEach(h => {
             batch.set(doc(db, "holidays", h.id), h);
          });
          batch.commit().catch(console.error);
       } else {
          setHolidays(data);
       }
    });

    // 6. Alumni
    const unsubAlumni = onSnapshot(collection(db, "alumni"), (snap) => {
       const data = snap.docs.map(doc => doc.data() as Alumni);
       setAlumni(data);
    });

    // 7. Headmaster
    const unsubHeadmaster = onSnapshot(doc(db, "settings", "headmaster"), (docSnap) => {
       if (docSnap.exists()) {
         setHeadmaster(docSnap.data() as Headmaster);
       } else {
          // Init headmaster if missing
          setDoc(doc(db, "settings", "headmaster"), INITIAL_HEADMASTER).catch(console.error);
       }
    });

    // 8. Subjects
    const unsubSubjects = onSnapshot(collection(db, "subjects"), (snap) => {
        const data = snap.docs.map(doc => doc.data() as Subject);
        setSubjects(data);
    });

    // 9. Subject Attendance
    const unsubSubjectAttendance = onSnapshot(collection(db, "subjectAttendance"), (snap) => {
        const data = snap.docs.map(doc => doc.data() as SubjectAttendanceRecord);
        setSubjectAttendance(data);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubStudents();
      unsubTeachers();
      unsubAttendance();
      unsubYears();
      unsubHolidays();
      unsubAlumni();
      unsubHeadmaster();
      unsubSubjects();
      unsubSubjectAttendance();
    };
  }, []);

  // --- AUTHENTICATION ---
  const login = (role: UserRole, data?: any) => {
    if (role === UserRole.ADMIN) {
      setCurrentUser({ role, name: 'Administrator' });
    } else if (role === UserRole.WALI_KELAS) {
      setCurrentUser({ 
        role, 
        id: data.id, 
        name: data.name, 
        classId: data.classId,
        accessibleClassIds: data.accessibleClassIds,
        subjectIds: data.subjectIds 
      });
    } else if (role === UserRole.ORANG_TUA) {
      setCurrentUser({ role, name: 'Orang Tua Siswa', id: data.nisn }); 
    }
  };

  const logout = () => setCurrentUser(null);

  // --- CRUD OPERATIONS (Direct to Firestore) ---
  
  const addStudent = async (s: Student) => {
    await setDoc(doc(db, "students", s.id), s);
  };
  
  const updateStudent = async (s: Student) => {
    await setDoc(doc(db, "students", s.id), s, { merge: true });
  };
  
  const deleteStudent = async (id: string) => {
    await deleteDoc(doc(db, "students", id));
  };

  const promoteStudent = async (id: string, newClassId: string, newYearId: string) => {
    await updateDoc(doc(db, "students", id), { classId: newClassId });
  };

  const moveToAlumni = async (studentId: string, reason: AlumniReason, date: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const activeYear = academicYears.find(y => y.isActive)?.name || 'Unknown';
    const newAlumni: Alumni = {
        ...student,
        reason,
        dateLeft: date,
        lastClassId: student.classId,
        academicYear: activeYear
    };

    // Add to Alumni Collection
    await setDoc(doc(db, "alumni", studentId), newAlumni);
    // Remove from Students Collection
    await deleteDoc(doc(db, "students", studentId));
  };

  const markAttendance = async (records: AttendanceRecord[]) => {
    const batch = writeBatch(db);
    records.forEach(record => {
        // Use setDoc to overwrite existing record for that day
        const ref = doc(db, "attendance", record.id);
        if (record.status === AttendanceStatus.NONE) {
            batch.delete(ref);
        } else {
            batch.set(ref, record);
        }
    });
    await batch.commit();
  };

  const addTeacher = async (t: Teacher) => {
    await setDoc(doc(db, "teachers", t.id), t);
  };

  const updateTeacher = async (t: Teacher) => {
    await setDoc(doc(db, "teachers", t.id), t, { merge: true });
  };

  const deleteTeacher = async (id: string) => {
    await deleteDoc(doc(db, "teachers", id));
  };

  const updateHeadmaster = async (h: Headmaster) => {
    await setDoc(doc(db, "settings", "headmaster"), h);
  };

  const addAcademicYear = async (name: string) => {
    const id = Date.now().toString();
    await setDoc(doc(db, "academicYears", id), { id, name, isActive: false });
  };

  const setAcademicYear = async (id: string) => {
    const batch = writeBatch(db);
    academicYears.forEach(y => {
        const ref = doc(db, "academicYears", y.id);
        batch.update(ref, { isActive: y.id === id });
    });
    await batch.commit();
  };

  const deleteAcademicYear = async (id: string) => {
    await deleteDoc(doc(db, "academicYears", id));
  };

  const toggleHoliday = async (h: Holiday) => {
    await setDoc(doc(db, "holidays", h.id), h);
  };

  const deleteHoliday = async (id: string) => {
    await deleteDoc(doc(db, "holidays", id));
  };

  // SUBJECTS CRUD
  const addSubject = async (s: Subject) => {
    await setDoc(doc(db, "subjects", s.id), s);
  };
  
  const updateSubject = async (s: Subject) => {
    await setDoc(doc(db, "subjects", s.id), s, { merge: true });
  };

  const deleteSubject = async (id: string) => {
    await deleteDoc(doc(db, "subjects", id));
  };

  const markSubjectAttendance = async (records: SubjectAttendanceRecord[]) => {
    const batch = writeBatch(db);
    records.forEach(record => {
        const ref = doc(db, "subjectAttendance", record.id);
        if (record.status === AttendanceStatus.NONE) {
            batch.delete(ref);
        } else {
            batch.set(ref, record);
        }
    });
    await batch.commit();
  };

  // --- MOCK SYNC FUNCTIONS (To satisfy interface) ---
  const triggerSave = () => { /* No-op in Firebase, autosave is active */ };
  const syncToCloud = async () => { return true; };
  const syncFromCloud = async () => { return true; };

  return (
    <AppContext.Provider value={{
      students, teachers, attendance, academicYears, holidays, headmaster, currentUser, alumni,
      subjects, subjectAttendance,
      googleScriptUrl, lastSync, isSyncing,
      login, logout, addStudent, updateStudent, deleteStudent, promoteStudent, moveToAlumni,
      markAttendance, updateHeadmaster, addTeacher, updateTeacher, deleteTeacher,
      setAcademicYear, addAcademicYear, deleteAcademicYear, toggleHoliday, deleteHoliday,
      addSubject, updateSubject, deleteSubject, markSubjectAttendance,
      setGoogleScriptUrl, syncToCloud, syncFromCloud, triggerSave, firebaseConfigError
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
