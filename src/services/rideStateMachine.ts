import { RequestStatus, RideRequest } from '../types';

export const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  created: ['searching', 'no_match'],
  searching: ['match_found', 'no_match'],
  match_found: ['contacted', 'no_match'],
  contacted: ['accepted', 'declined'],
  accepted: ['completed', 'declined'],
  declined: [], // terminal
  completed: [], // terminal
  no_match: [], // terminal
};

/**
 * Checks if a state transition is permitted by the lifecycle state machine.
 */
export function canTransition(current: RequestStatus, next: RequestStatus): boolean {
  const allowed = VALID_TRANSITIONS[current];
  return Boolean(allowed && allowed.includes(next));
}

/**
 * Privacy Rule TC-07:
 * Phone number stays masked until a ride request is ACCEPTED by both parties.
 */
export function isContactRevealed(status: RequestStatus): boolean {
  return status === 'accepted' || status === 'completed';
}

/**
 * Privacy Rule TC-08:
 * Live location is shared only between the two students of an ACCEPTED ride,
 * only while it is active, and ceases automatically upon completion.
 */
export function isLiveLocationSharingPermitted(status: RequestStatus): boolean {
  return status === 'accepted';
}

/**
 * Performs a validated lifecycle state transition.
 */
export function transitionRideRequest(
  request: RideRequest,
  nextStatus: RequestStatus
): RideRequest {
  if (!canTransition(request.status, nextStatus)) {
    throw new Error(
      `Invalid lifecycle transition: Cannot move from '${request.status}' to '${nextStatus}'.`
    );
  }

  return {
    ...request,
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };
}
