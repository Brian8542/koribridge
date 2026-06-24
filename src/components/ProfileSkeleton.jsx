import React from "react";

function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-150 shadow-xs p-5">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="h-3.5 skeleton rounded-md w-1/3" />
          <div className="h-2.5 skeleton rounded-md w-1/2" />
          <div className="flex gap-1.5 mt-3">
            <div className="h-5 skeleton rounded-md w-16" />
            <div className="h-5 skeleton rounded-md w-16" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-12 skeleton rounded-lg" />
        <div className="h-12 skeleton rounded-lg" />
      </div>
      <div className="h-2.5 skeleton rounded-md w-3/4 mt-3" />
      <div className="flex gap-2 mt-5">
        <div className="h-9 skeleton rounded-xl flex-1" />
        <div className="h-9 skeleton rounded-xl flex-1" />
      </div>
    </div>
  );
}

export default React.memo(ProfileSkeleton);
