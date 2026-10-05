import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, StudentRole, Vehicle } from '../types';
import { demoStore } from '../services/demoStore';

interface AuthContextType {
  currentUser: Student | null;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (studentData: {
    fullName: string;
    collegeEmail: string;
    phoneNumber: string;
    department: string;
    year: string;
    enrollmentNo: string;
    role: StudentRole;
    vehicle?: Omit<Vehicle, 'id' | 'student_id'>;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoUser: (studentId: string) => void;
  loginAsDemoStudent: () => void;
  loginAsDemoAdmin: () => void;
  updateRole: (role: StudentRole) => void;
  updateProfile: (updates: Partial<Student>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAIN = import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || 'dypcoeakurdi.ac.in';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Student | null>(null);

  useEffect(() => {
    const user = demoStore.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const login = async (email: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Domain validation
    if (!cleanEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return {
        success: false,
        error: `Only official college emails ending in @${ALLOWED_DOMAIN} are allowed.`,
      };
    }

    const students = demoStore.getStudents();
    const found = students.find((s) => s.college_email.toLowerCase() === cleanEmail);
    if (found) {
      demoStore.setCurrentUser(found);
      setCurrentUser(found);
      return { success: true };
    }

    return {
      success: false,
      error: 'No account registered with this college email. Please sign up first.',
    };
  };

  const signup = async (data: {
    fullName: string;
    collegeEmail: string;
    phoneNumber: string;
    department: string;
    year: string;
    enrollmentNo: string;
    role: StudentRole;
    vehicle?: Omit<Vehicle, 'id' | 'student_id'>;
  }) => {
    const cleanEmail = data.collegeEmail.trim().toLowerCase();

    // Domain validation (TC-02)
    if (!cleanEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return {
        success: false,
        error: `Invalid college email domain. Must end in @${ALLOWED_DOMAIN}.`,
      };
    }

    // Check duplicate
    const existing = demoStore.getStudents().find(
      (s) => s.college_email.toLowerCase() === cleanEmail || s.enrollment_no === data.enrollmentNo
    );
    if (existing) {
      return {
        success: false,
        error: 'An account with this email or enrollment number already exists.',
      };
    }

    // Create student
    const newStudent = demoStore.registerStudent({
      college_email: cleanEmail,
      full_name: data.fullName,
      phone_number: data.phoneNumber,
      department: data.department,
      year: data.year,
      enrollment_no: data.enrollmentNo,
      role: data.role,
      is_verified: false, // Must upload ID card to get verified
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
      is_admin: false,
    });

    // If offering ride and vehicle provided, attach vehicle
    if (data.role !== 'need' && data.vehicle) {
      const vehicleWithIds: Vehicle = {
        ...data.vehicle,
        id: `veh-${Date.now()}`,
        student_id: newStudent.id,
      };
      newStudent.vehicle = vehicleWithIds;
      demoStore.updateStudent(newStudent);
    }

    demoStore.setCurrentUser(newStudent);
    setCurrentUser(newStudent);

    // Prompt for ID verification via in-app notification
    demoStore.createNotification({
      student_id: newStudent.id,
      title: 'Action Required: Upload College ID',
      message: 'Please upload your DYPCOE student ID card to earn the blue Verified Student badge and unlock direct ride calls.',
      type: 'verification_status',
    });

    return { success: true };
  };

  const logout = () => {
    demoStore.setCurrentUser(null);
    setCurrentUser(null);
  };

  const switchDemoUser = (studentId: string) => {
    const user = demoStore.getStudentById(studentId);
    if (user) {
      demoStore.setCurrentUser(user);
      setCurrentUser(user);
    }
  };

  const loginAsDemoStudent = () => {
    // Rohan Sharma (Driver/Offer) or Sneha Patil (Passenger/Need)
    const rohan = demoStore.getStudentById('student-rohan-01');
    if (rohan) {
      demoStore.setCurrentUser(rohan);
      setCurrentUser(rohan);
    }
  };

  const loginAsDemoAdmin = () => {
    const admin = demoStore.getStudents().find((s) => s.is_admin);
    if (admin) {
      demoStore.setCurrentUser(admin);
      setCurrentUser(admin);
    }
  };

  const updateRole = (role: StudentRole) => {
    if (!currentUser) return;
    const updated = demoStore.updateStudent({ id: currentUser.id, role });
    setCurrentUser(updated);
  };

  const updateProfile = (updates: Partial<Student>) => {
    if (!currentUser) return;
    const updated = demoStore.updateStudent({ ...updates, id: currentUser.id });
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin: Boolean(currentUser?.is_admin),
        login,
        signup,
        logout,
        switchDemoUser,
        loginAsDemoStudent,
        loginAsDemoAdmin,
        updateRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
