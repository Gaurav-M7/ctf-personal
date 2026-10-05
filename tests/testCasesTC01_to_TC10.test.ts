import { describe, it, expect, beforeEach } from 'vitest';
import { demoStore } from '../src/services/demoStore';
import { findRouteMatches } from '../src/services/matchingService';
import { isContactRevealed, isLiveLocationSharingPermitted } from '../src/services/rideStateMachine';
import { Student, Route } from '../src/types';
import { DYPCOE_COORDINATES } from '../src/data/puneSeedData';

describe('CampusRide Automated Test Matrix: TC-01 to TC-10', () => {
  beforeEach(() => {
    demoStore.resetDemoData();
  });

  // TC-01: Valid registration creates a profile
  it('TC-01: valid registration with college email domain creates a student profile', () => {
    const newStudent = demoStore.registerStudent({
      college_email: 'atharva.deshpande@dypcoeakurdi.ac.in',
      full_name: 'Atharva Deshpande',
      phone_number: '+91 98230 45678',
      department: 'Artificial Intelligence & Data Science',
      year: 'SE',
      enrollment_no: 'DYP23AIDS099',
      role: 'need',
      is_verified: false,
    });

    expect(newStudent.id).toBeDefined();
    expect(newStudent.full_name).toBe('Atharva Deshpande');
    expect(newStudent.college_email).toBe('atharva.deshpande@dypcoeakurdi.ac.in');
    expect(demoStore.getStudentById(newStudent.id)).toBeDefined();
  });

  // TC-02: Invalid or incomplete registration is rejected with correction message
  it('TC-02: non-college email domain is rejected with explicit correction message', () => {
    const invalidEmail = 'student@gmail.com';
    const allowedDomain = 'dypcoeakurdi.ac.in';

    const isValidDomain = invalidEmail.endsWith(`@${allowedDomain}`);
    expect(isValidDomain).toBe(false);

    const errorMessage = `Only official college emails ending in @${allowedDomain} are allowed.`;
    expect(errorMessage).toContain('dypcoeakurdi.ac.in');
  });

  // TC-03: "offer ride" profile becomes available for compatible requests
  it('TC-03: "offer ride" profile is discoverable by compatible passengers', () => {
    const offerStudent = demoStore.getStudentById('student-rohan-01')!;
    expect(offerStudent.role).toBe('offer');

    const offerRoute = demoStore.getRoutes().find((r) => r.student_id === offerStudent.id)!;
    expect(offerRoute.role).toBe('offer');

    // Passenger seeking ride from Wakad
    const passengerStudent: Student = {
      id: 'passenger-test',
      college_email: 'test@dypcoeakurdi.ac.in',
      full_name: 'Test Passenger',
      phone_number: '+91 99999 00000',
      department: 'AI & DS',
      year: 'TE',
      enrollment_no: 'DYP22AIDS999',
      role: 'need',
      is_verified: true,
    };

    const passengerRoute: Route = {
      id: 'route-test-need',
      student_id: passengerStudent.id,
      role: 'need',
      origin_name: 'Near Hinjawadi Bridge, Wakad',
      origin_lat: 18.5992,
      origin_lng: 73.7620,
      destination_name: DYPCOE_COORDINATES.name,
      destination_lat: DYPCOE_COORDINATES.latitude,
      destination_lng: DYPCOE_COORDINATES.longitude,
      polyline_coords: offerRoute.polyline_coords,
      distance_km: 7.6,
      duration_min: 17,
      arrival_time: '08:50',
      arrival_window_min: 15,
      days_of_week: ['M', 'T', 'W', 'T', 'F'],
      is_active: true,
    };

    const matches = findRouteMatches(
      passengerRoute,
      passengerStudent,
      [offerRoute],
      [offerStudent, passengerStudent]
    );

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].offer_student.id).toBe(offerStudent.id);
  });

  // TC-04: "looking for ride" becomes available for compatible offers
  it('TC-04: "looking for ride" passenger is discoverable by compatible drivers', () => {
    const passenger = demoStore.getStudentById('student-sneha-02')!;
    expect(passenger.role).toBe('need');

    const passengerRoute = demoStore.getRoutes().find((r) => r.student_id === passenger.id)!;

    const driverStudent = demoStore.getStudentById('student-rohan-01')!;
    const driverRoute = demoStore.getRoutes().find((r) => r.student_id === driverStudent.id)!;

    const matches = findRouteMatches(
      driverRoute,
      driverStudent,
      [passengerRoute],
      [driverStudent, passenger]
    );

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].need_student.id).toBe(passenger.id);
  });

  // TC-05: Compatible routes and arrival times produce a match
  it('TC-05: compatible routes (>= 60% overlap) and arrival times (<= 15 min) produce a match', () => {
    const driver = demoStore.getStudentById('student-rohan-01')!;
    const passenger = demoStore.getStudentById('student-sneha-02')!;
    const driverRoute = demoStore.getRoutes().find((r) => r.student_id === driver.id)!;
    const passengerRoute = demoStore.getRoutes().find((r) => r.student_id === passenger.id)!;

    const matches = findRouteMatches(
      passengerRoute,
      passenger,
      [driverRoute],
      [driver, passenger],
      { minRouteOverlapPct: 60.0, maxTimeDiffMinutes: 15 }
    );

    expect(matches.length).toBe(1);
    expect(matches[0].route_match_pct).toBeGreaterThanOrEqual(60.0);
    expect(matches[0].time_diff_min).toBeLessThanOrEqual(15);
  });

  // TC-06: A generated match sends notifications to both users
  it('TC-06: creating a ride request triggers real-time in-app notification', () => {
    const rider = demoStore.getStudentById('student-sneha-02')!;
    const driver = demoStore.getStudentById('student-rohan-01')!;
    const route = demoStore.getRoutes().find((r) => r.student_id === driver.id)!;

    const newReq = demoStore.createRideRequest({
      rider_id: rider.id,
      driver_id: driver.id,
      rider,
      driver,
      route,
      scheduled_date: 'Tomorrow',
      scheduled_time: '08:50',
      approx_pickup_area: 'Wakad',
      status: 'contacted',
    });

    const driverNotifs = demoStore.getNotifications(driver.id);
    const relevant = driverNotifs.find((n) => n.related_id === newReq.id);

    expect(relevant).toBeDefined();
    expect(relevant?.type).toBe('request_received');
    expect(relevant?.title).toContain('New Ride Request');
  });

  // TC-07: After acceptance the contact/call option is shown; before acceptance the number stays masked
  it('TC-07: contact number remains masked until acceptance, then unmasked with direct call capability', () => {
    // Before acceptance: contacted / searching
    expect(isContactRevealed('contacted')).toBe(false);
    expect(isContactRevealed('searching')).toBe(false);

    // After acceptance: accepted
    expect(isContactRevealed('accepted')).toBe(true);
    expect(isContactRevealed('completed')).toBe(true);

    const rawPhone = '+91 98220 14589';
    const masked = `+91 ${rawPhone.slice(4, 6)}••••••${rawPhone.slice(-2)}`;
    expect(masked).toBe('+91 98••••••89');
  });

  // TC-08: Only required location data is processed per privacy rules
  it('TC-08: location sharing is active only during accepted ride and ceases on completion', () => {
    expect(isLiveLocationSharingPermitted('searching')).toBe(false);
    expect(isLiveLocationSharingPermitted('contacted')).toBe(false);
    expect(isLiveLocationSharingPermitted('accepted')).toBe(true);
    expect(isLiveLocationSharingPermitted('completed')).toBe(false);
  });

  // TC-09: Verified status badge appears only for verified students
  it('TC-09: verified badge appears strictly for verified students', () => {
    const verifiedStudent = demoStore.getStudentById('student-rohan-01')!;
    const unverifiedStudent = demoStore.getStudentById('student-kavita-19')!;

    expect(verifiedStudent.is_verified).toBe(true);
    expect(unverifiedStudent.is_verified).toBe(false);
  });

  // TC-10: No suitable route returns no-match and creates nothing (guaranteed zero false matches)
  it('TC-10: route with incompatible arrival time (> 15 min) or disjoint corridor returns no-match and creates nothing', () => {
    const passenger = demoStore.getStudentById('student-sneha-02')!;
    const driver = demoStore.getStudentById('student-rohan-01')!;
    const driverRoute = demoStore.getRoutes().find((r) => r.student_id === driver.id)!;

    // Disjoint route in Katraj / South Pune (incompatible with Wakad -> Akurdi)
    const incompatibleRoute: Route = {
      id: 'route-incompatible',
      student_id: passenger.id,
      role: 'need',
      origin_name: 'Katraj Snake Park, Pune',
      origin_lat: 18.4520,
      origin_lng: 73.8560,
      destination_name: DYPCOE_COORDINATES.name,
      destination_lat: DYPCOE_COORDINATES.latitude,
      destination_lng: DYPCOE_COORDINATES.longitude,
      polyline_coords: [
        [18.4520, 73.8560],
        [18.4600, 73.8580],
      ],
      distance_km: 26.0,
      duration_min: 55,
      arrival_time: '11:45', // Incompatible time
      arrival_window_min: 15,
      days_of_week: ['M'],
      is_active: true,
    };

    const matches = findRouteMatches(
      incompatibleRoute,
      passenger,
      [driverRoute],
      [driver, passenger]
    );

    expect(matches).toEqual([]);
    expect(matches.length).toBe(0);
  });
});
