import React from 'react';

interface RouteTimelineProps {
  originName: string;
  destinationName?: string;
  approxArea?: string;
  arrivalTime?: string;
  timeDiff?: string;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  originName,
  destinationName = 'DY Patil College of Engg (DYPCOE)',
  approxArea,
  arrivalTime,
  timeDiff,
}) => {
  return (
    <div className="flex flex-col gap-2 relative pl-6 my-2 text-left">
      {/* Connecting journey line */}
      <div className="absolute left-[7px] top-[10px] bottom-[10px] w-[2px] bg-outline-variant/40 flex flex-col justify-between py-0.5">
        <span className="w-[2px] h-[3px] bg-primary rounded-full"></span>
        <span className="w-[2px] h-[3px] bg-primary rounded-full"></span>
        <span className="w-[2px] h-[3px] bg-secondary rounded-full"></span>
      </div>

      {/* Origin */}
      <div className="flex items-start justify-between min-w-0">
        <div className="relative">
          <span className="absolute -left-[23px] top-[3px] w-3.5 h-3.5 rounded-full border-2 border-primary bg-surface flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          </span>
          <div className="min-w-0">
            <span className="font-label-md text-xs font-semibold text-on-surface block truncate">
              {originName}
            </span>
            {approxArea && (
              <span className="text-[11px] text-on-surface-variant block truncate">
                Approx. {approxArea}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className="flex items-start justify-between min-w-0 pt-1">
        <div className="relative">
          <span className="absolute -left-[23px] top-[3px] w-3.5 h-3.5 rounded-full border-2 border-secondary bg-surface flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-xs font-bold text-on-surface block truncate">
                {destinationName}
              </span>
              <span className="material-symbols-outlined text-secondary text-[14px]">school</span>
            </div>
            {arrivalTime && (
              <span className="text-[11px] text-primary font-medium block">
                Arrives {arrivalTime} {timeDiff && <span className="text-secondary font-bold">({timeDiff})</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
