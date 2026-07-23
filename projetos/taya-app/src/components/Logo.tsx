type LogoProps = {
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
};

export function Logo({ variant = "default", size = "md", className = "" }: LogoProps) {
  return (
    <img
      src="/images/logopodeja.svg"
      alt="Pode Já"
      className={`${sizeMap[size]} w-auto object-contain ${
        variant === "white" ? "brightness-0 invert" : ""
      } ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const fallback = document.createElement("span");
        fallback.textContent = "Pode Já";
        fallback.className = `text-lg font-bold ${
          variant === "white" ? "text-white" : "text-[#FD5F31]"
        }`;
        target.parentElement?.appendChild(fallback);
      }}
    />
  );
}
