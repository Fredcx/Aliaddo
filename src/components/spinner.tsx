interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const sizes = {
    xs: "w-3.5 h-3.5 border-[1.5px]",
    sm: "w-5 h-5 border-[1.5px]",
    md: "w-7 h-7 border-2",
    lg: "w-10 h-10 border-[2.5px]",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
    return (
        <div
            className={`rounded-full border-transparent border-t-[#15B392] animate-spin ${sizes[size]} ${className}`}
        />
    );
}
