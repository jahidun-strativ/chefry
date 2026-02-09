import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Image priority src="/main-logo.png" alt="Logo" width={250} height={100} />
      <SignIn  afterSignInUrl="/admin" afterSignUpUrl="/admin" />
    </div>
  );
}
