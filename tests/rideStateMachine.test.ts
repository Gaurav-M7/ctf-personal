import { describe, it, expect } from 'vitest';
import {
  canTransition,
  transitionRideRequest,
  isContactRevealed,
  isLiveLocationSharingPermitted,
} from '../src/services/rideStateMachine';
import { RideRequest } from '../src/types';
import { SEED_STUDENTS, SEED_ROUTES } from '../src/data/puneSeedData';

describe('Ride Request Lifecycle State Machine', () => {
  const dummyRequest: RideRequest = {
    id: 'req-test-1',
    rider_id: SEED_STUDENTS[1].id,
    driver_id: SEED_STUDENTS[0].id,
    rider: SEED_STUDENTS[1],
    driver: SEED_STUDENTS[0],
    route: SEED_ROUTES[0],
    scheduled_date: 'Tomorrow',
    scheduled_time: '08:50',
    approx_pickup_area: 'Wakad',
    status: 'created',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('allows valid transitions according to state graph', () => {
    expect(canTransition('created', 'searching')).toBe(true);
    expect(canTransition('searching', 'match_found')).toBe(true);
    expect(canTransition('match_found', 'contacted')).toBe(true);
    expect(canTransition('contacted', 'accepted')).toBe(true);
    expect(canTransition('contacted', 'declined')).toBe(true);
    expect(canTransition('accepted', 'completed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('created', 'completed')).toBe(false);
    expect(canTransition('declined', 'accepted')).toBe(false);
    expect(canTransition('completed', 'searching')).toBe(false);
  });

  it('transitions state correctly and updates timestamp', () => {
    const updated = transitionRideRequest(dummyRequest, 'searching');
    expect(updated.status).toBe('searching');
  });

  it('throws error on illegal state transition attempt', () => {
    expect(() => transitionRideRequest(dummyRequest, 'completed')).toThrow();
  });

  it('enforces TC-07: Contact is revealed ONLY in accepted and completed states', () => {
    expect(isContactRevealed('created')).toBe(false);
    expect(isContactRevealed('searching')).toBe(false);
    expect(isContactRevealed('match_found')).toBe(false);
    expect(isContactRevealed('contacted')).toBe(false);
    expect(isContactRevealed('declined')).toBe(false);
    expect(isContactRevealed('no_match')).toBe(false);

    // Only unmasked here
    expect(isContactRevealed('accepted')).toBe(true);
    expect(isContactRevealed('completed')).toBe(true);
  });

  it('enforces TC-08: Live location streaming permitted ONLY during accepted active ride', () => {
    expect(isLiveLocationSharingPermitted('searching')).toBe(false);
    expect(isLiveLocationSharingPermitted('contacted')).toBe(false);
    expect(isLiveLocationSharingPermitted('accepted')).toBe(true);
    expect(isLiveLocationSharingPermitted('completed')).toBe(false); // ceases on completion
  });
});
