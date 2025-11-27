"use client";

import Image from "next/image";

interface LandingLogoProps {
  className?: string;
}

export function LandingLogo({ className }: LandingLogoProps) {
  return (
    <div className={`relative mb-8 group ${className}`}>
      {/* Animated Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>

      {/* Logo Container */}
      <div>
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          <Image
            src="/logo-full.png"
            alt="Logo BDE FEN'SUP"
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] brightness-110 group-hover:brightness-125 transition-all duration-300"
            priority
          />
        </div>
      </div>
    </div>
  );
}
