import React from "react";
import Image from "next/image";

interface BrandLogoProps {
    className?: string;
    variant?: "full" | "icon";
}

export function BrandLogo({ className = "", variant = "full" }: BrandLogoProps) {
    const src = variant === "full" ? "/logo-full-real.png" : "/logo-icon-real.png";
    const alt = variant === "full" ? "AliaDDO Logo" : "AliaDDO Icon";

    return (
        <div className={`flex items-center select-none ${className}`}>
            {/* Usando h-[1em] e w-auto garante que apenas cresça na altura mantendo a proporção exata da largura */}
            <img
                src={src}
                alt={alt}
                className="h-[1em] w-auto object-contain drop-shadow-sm"
                draggable={false}
            />
        </div>
    );
}
