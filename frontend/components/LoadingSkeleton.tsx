"use client";

interface LoadingSkeletonProps {
    className?: string;
}

export default function LoadingSkeleton({ className = "h-32 w-full" }: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`}>
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
        </div>
    );
}
