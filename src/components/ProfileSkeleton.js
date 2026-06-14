import React from "react";

function ProfileSkeleton() {
  return (
    <div className="card p-6 animate-pulse border-gray-100">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-10 bg-gray-50 rounded-xl w-full mt-4" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <div className="h-10 bg-gray-200 rounded-2xl flex-1" />
        <div className="h-10 bg-gray-200 rounded-2xl flex-1" />
      </div>
    </div>
  );
}

export default React.memo(ProfileSkeleton);
