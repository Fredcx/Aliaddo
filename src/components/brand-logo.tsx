import React from "react";
import Image from "next/image";

interface BrandLogoProps {
    className?: string;
    variant?: "full" | "icon";
    compact?: boolean;
}

export function BrandLogo({ className = "", variant = "full", compact = false }: BrandLogoProps) {
    const src = variant === "full" ? "/logo-full-real.png" : "/logo-icon-real.png";
    const alt = variant === "full" ? "AliaDDO Logo" : "AliaDDO Icon";

    if (compact && variant === "full") return <div className="relative h-[34px] w-[150px] overflow-hidden"><Image src={src} alt={alt} width={1024} height={1024} className="absolute -top-[56px] left-0 h-[150px] w-[150px]" priority /></div>;
    return (
        <div className={`flex items-center select-none ${className}`}>
            {/* Usando h-[1em] e w-auto garante que apenas cresça na altura mantendo a proporção exata da largura */}
            <Image
                src={src}
                alt={alt}
                width={1024}
                height={1024}
                className="h-[1em] w-auto object-contain drop-shadow-sm"
                draggable={false}
            />
        </div>
    );
}
