import Image from "next/image";

export function Logo({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Brain Push"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
