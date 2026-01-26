import type { StaticImageData } from "next/image";
import Image from "next/image";
import { SignUp } from "@clerk/nextjs";

import logo from "@/assets/logo.svg";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Image priority src={(logo as StaticImageData).src} alt="Logo" width={250} height={100} />
      <SignUp afterSignInUrl="/admin" afterSignUpUrl="/admin" />
    </div>
  );
}
