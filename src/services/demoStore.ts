import {
  Student,
  Route,
  VerificationRequest,
  RideRequest,
  NotificationItem,
  RatingReview,
  PrivacySettings,
  UserReport,
  StudentRole,
} from '../types';
import {
  SEED_STUDENTS,
  SEED_ROUTES,
  SEED_VERIFICATION_REQUESTS,
  SEED_RIDE_REQUESTS,
  SEED_NOTIFICATIONS,
} from '../data/puneSeedData';

const STORAGE_KEYS = {
  CURRENT_USER: 'campusride_current_user',
  STUDENTS: 'campusride_students',
  ROUTES: 'campusride_routes',
  VERIFICATION_REQUESTS: 'campusride_verifications',
  RIDE_REQUESTS: 'campusride_ride_requests',
  NOTIFICATIONS: 'campusride_notifications',
  RATINGS: 'campusride_ratings',
  REPORTS: 'campusride_reports',
  PRIVACY: 'campusride_privacy',
};

class DemoStore {
  private students: Student[] = [];
  private routes: Route[] = [];
  private verifications: VerificationRequest[] = [];
  private rideRequests: RideRequest[] = [];
  private notifications: NotificationItem[] = [];
  private ratings: RatingReview[] = [];
  private reports: UserReport[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (typeof localStorage !== 'undefined') {
        // One-time cleanup of old dummy data if previously stored
        if (localStorage.getItem('campusride_cleaned_v2') !== 'true') {
          localStorage.removeItem(STORAGE_KEYS.STUDENTS);
          localStorage.removeItem(STORAGE_KEYS.ROUTES);
          localStorage.removeItem(STORAGE_KEYS.VERIFICATION_REQUESTS);
          localStorage.removeItem(STORAGE_KEYS.RIDE_REQUESTS);
          localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          localStorage.setItem('campusride_cleaned_v2', 'true');
        }

        const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        this.students = storedStudents ? JSON.parse(storedStudents) : [];

        const storedRoutes = localStorage.getItem(STORAGE_KEYS.ROUTES);
        this.routes = storedRoutes ? JSON.parse(storedRoutes) : [];

        const storedVerifications = localStorage.getItem(STORAGE_KEYS.VERIFICATION_REQUESTS);
        this.verifications = storedVerifications ? JSON.parse(storedVerifications) : [];

        const storedRequests = localStorage.getItem(STORAGE_KEYS.RIDE_REQUESTS);
        this.rideRequests = storedRequests ? JSON.parse(storedRequests) : [];

        const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [];

        const storedRatings = localStorage.getItem(STORAGE_KEYS.RATINGS);
        this.ratings = storedRatings ? JSON.parse(storedRatings) : [];

        const storedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
        this.reports = storedReports ? JSON.parse(storedReports) : [];
      } else {
        this.students = [];
        this.routes = [];
        this.verifications = [];
        this.rideRequests = [];
        this.notifications = [];
      }
    } catch (e) {
      this.students = [];
      this.routes = [];
      this.verifications = [];
      this.rideRequests = [];
      this.notifications = [];
    }
  }

  private save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(this.routes));
        localStorage.setItem(STORAGE_KEYS.VERIFICATION_REQUESTS, JSON.stringify(this.verifications));
        localStorage.setItem(STORAGE_KEYS.RIDE_REQUESTS, JSON.stringify(this.rideRequests));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
        localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(this.ratings));
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // Auth & Student Helpers
  getCurrentUser(): Student | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return null;
  }

  setCurrentUser(user: Student | null) {
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    }
  }

  getStudents(): Student[] {
    return [...this.students];
  }

  getStudentById(id: string): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  updateStudent(student: Partial<Student> & { id: string }): Student {
    const idx = this.students.findIndex((s) => s.id === student.id);
    if (idx !== -1) {
      this.students[idx] = { ...this.students[idx], ...student };
      this.save();
      const current = this.getCurrentUser();
      if (current?.id === student.id) {
        this.setCurrentUser(this.students[idx]);
      }
      return this.students[idx];
    }
    throw new Error('Student not found');
  }

  registerStudent(newStudent: Omit<Student, 'id'>): Student {
    const student: Student = {
      ...newStudent,
      id: `student-${Date.now()}`,
      rating: 5.0,
      total_rides: 0,
      co2_saved_kg: 0,
    };
    this.students.push(student);
    this.save();
    return student;
  }

  // Verification
  getVerificationRequests(): VerificationRequest[] {
    return [...this.verifications];
  }

  submitVerification(req: Omit<VerificationRequest, 'id' | 'status' | 'created_at'>): VerificationRequest {
    const newReq: VerificationRequest = {
      ...req,
      id: `verif-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.verifications.push(newReq);
    this.save();
    return newReq;
  }

  reviewVerification(requestId: string, status: 'verified' | 'rejected', rejectionReason?: string): VerificationRequest {
    const idx = this.verifications.findIndex((v) => v.id === requestId);
    if (idx !== -1) {
      this.verifications[idx].status = status;
      this.verifications[idx].rejection_reason = rejectionReason;
      this.verifications[idx].reviewed_at = new Date().toISOString();

      // Update student's is_verified flag
      const studentId = this.verifications[idx].student_id;
      const studentIdx = this.students.findIndex((s) => s.id === studentId);
      if (studentIdx !== -1) {
        this.students[studentIdx].is_verified = (status === 'verified');
        const current = this.getCurrentUser();
        if (current?.id === studentId) {
          this.setCurrentUser(this.students[studentIdx]);
        }
      }

      // Create notification for student
      this.createNotification({
        student_id: studentId,
        title: status === 'verified' ? 'Student Verification Approved!' : 'Verification Update',
        message: status === 'verified'
          ? 'Your college ID has been verified by the Department Coordinator. You now have full access with the Verified Student badge!'
          : `Your verification request was rejected: ${rejectionReason || 'Please upload a clearer college ID photo.'}`,
        type: 'verification_status',
      });

      this.save();
      return this.verifications[idx];
    }
    throw new Error('Verification request not found');
  }

  // Routes
  getRoutes(): Route[] {
    return [...this.routes];
  }

  addRoute(route: Omit<Route, 'id'>): Route {
    const newRoute: Route = {
      ...route,
      id: `route-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.routes.unshift(newRoute);
    this.save();
    return newRoute;
  }

  deleteRoute(routeId: string) {
    this.routes = this.routes.filter((r) => r.id !== routeId);
    this.save();
  }

  // Ride Requests & State Machine transitions
  getRideRequests(): RideRequest[] {
    return [...this.rideRequests];
  }

  createRideRequest(req: Omit<RideRequest, 'id' | 'created_at' | 'updated_at'>): RideRequest {
    const newRequest: RideRequest = {
      ...req,
      id: `req-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.rideRequests.unshift(newRequest);

    // Notify Driver
    this.createNotification({
      student_id: newRequest.driver_id,
      title: 'New Ride Request Received',
      message: `${newRequest.rider.full_name} wants to share your ride to DYPCOE at ${newRequest.scheduled_time}.`,
      type: 'request_received',
      related_id: newRequest.id,
    });

    this.save();
    return newRequest;
  }

  updateRideRequestStatus(requestId: string, status: RideRequest['status']): RideRequest {
    const idx = this.rideRequests.findIndex((r) => r.id === requestId);
    if (idx !== -1) {
      this.rideRequests[idx].status = status;
      this.rideRequests[idx].updated_at = new Date().toISOString();

      const req = this.rideRequests[idx];
      if (status === 'accepted') {
        // Notify Rider
        this.createNotification({
          student_id: req.rider_id,
          title: 'Ride Request Accepted!',
          message: `${req.driver.full_name} accepted your ride request. You can now tap to call directly!`,
          type: 'request_accepted',
          related_id: req.id,
        });
      } else if (status === 'declined') {
        this.createNotification({
          student_id: req.rider_id,
          title: 'Ride Request Declined',
          message: `${req.driver.full_name} could not accept your ride request at this time.`,
          type: 'request_declined',
          related_id: req.id,
        });
      } else if (status === 'completed') {
        // Increment total rides and compute CO2 saved
        const dist = req.route.distance_km || 7.5;
        const co2Saved = +(dist * 0.12).toFixed(2);

        // Update driver stats
        const driverIdx = this.students.findIndex((s) => s.id === req.driver_id);
        if (driverIdx !== -1) {
          this.students[driverIdx].total_rides = (this.students[driverIdx].total_rides || 0) + 1;
          this.students[driverIdx].co2_saved_kg = +((this.students[driverIdx].co2_saved_kg || 0) + co2Saved).toFixed(2);
        }

        // Update rider stats
        const riderIdx = this.students.findIndex((s) => s.id === req.rider_id);
        if (riderIdx !== -1) {
          this.students[riderIdx].total_rides = (this.students[riderIdx].total_rides || 0) + 1;
          this.students[riderIdx].co2_saved_kg = +((this.students[riderIdx].co2_saved_kg || 0) + co2Saved).toFixed(2);
        }

        // Notify both parties
        this.createNotification({
          student_id: req.rider_id,
          title: 'Ride Completed!',
          message: `Your ride with ${req.driver.full_name} completed. You saved ${co2Saved} kg of CO2! Leave a rating.`,
          type: 'ride_completed',
          related_id: req.id,
        });

        this.createNotification({
          student_id: req.driver_id,
          title: 'Ride Completed!',
          message: `Your ride with ${req.rider.full_name} completed. You saved ${co2Saved} kg of CO2! Leave a rating.`,
          type: 'ride_completed',
          related_id: req.id,
        });
      }

      this.save();
      return this.rideRequests[idx];
    }
    throw new Error('Request not found');
  }

  // Notifications
  getNotifications(studentId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.student_id === studentId);
  }

  createNotification(notif: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>): NotificationItem {
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(item);
    this.save();
    return item;
  }

  markNotificationAsRead(id: string) {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notifications[idx].is_read = true;
      this.save();
    }
  }

  markAllNotificationsAsRead(studentId: string) {
    this.notifications.forEach((n) => {
      if (n.student_id === studentId) {
        n.is_read = true;
      }
    });
    this.save();
  }

  // Ratings
  addRating(rating: Omit<RatingReview, 'id' | 'created_at'>): RatingReview {
    const newRating: RatingReview = {
      ...rating,
      id: `rate-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.ratings.push(newRating);

    // Update target student's average rating
    const studentRatings = this.ratings.filter((r) => r.rated_student_id === rating.rated_student_id);
    const avg = studentRatings.reduce((acc, curr) => acc + curr.rating, 0) / studentRatings.length;
    const sIdx = this.students.findIndex((s) => s.id === rating.rated_student_id);
    if (sIdx !== -1) {
      this.students[sIdx].rating = +avg.toFixed(1);
    }

    this.save();
    return newRating;
  }

  // Reports
  createReport(report: Omit<UserReport, 'id' | 'status' | 'created_at'>): UserReport {
    const newReport: UserReport = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.reports.push(newReport);
    this.save();
    return newReport;
  }

  getReports(): UserReport[] {
    return [...this.reports];
  }

  // Reset to clean empty state (no dummy data)
  resetDemoData() {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
      localStorage.setItem('campusride_cleaned_v2', 'true');
    }
    this.students = [];
    this.routes = [];
    this.verifications = [];
    this.rideRequests = [];
    this.notifications = [];
    this.ratings = [];
    this.reports = [];
    this.save();
  }

  // Load sample seed data for testing
  loadSampleSeedData() {
    this.students = [...SEED_STUDENTS];
    this.routes = [...SEED_ROUTES];
    this.verifications = [...SEED_VERIFICATION_REQUESTS];
    this.rideRequests = [...SEED_RIDE_REQUESTS];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.save();
  }
}

export const demoStore = new DemoStore();
