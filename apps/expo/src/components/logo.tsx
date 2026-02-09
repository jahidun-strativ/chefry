import { Image } from "@/components/image";
import mainLogo from "@/assets/main-logo.png";
import secondaryLogo from "@/assets/secondary-logo.png";

export function Logo({ width, height, variant = "main" }: { width: number; height: number; variant?: "main" | "secondary" }) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logoSource = variant === "secondary" ? secondaryLogo : mainLogo;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  return <Image source={logoSource as any} style={{ width, height }} contentFit="contain" />;
}
