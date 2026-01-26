import { Check } from "lucide-react";

export default function AccountSetupCompletePage() {
  return (
    <div className="flex flex-col items-center justify-center pt-12">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white bg-gradient-to-tr from-[#938DFB] to-[#EB004C] shadow">
        <Check size={50} color="white" />
      </div>
      <h2 className="text-center text-2xl font-bold text-white">Account setup complete</h2>
      <p className="mt-2 text-center text-gray-300">You have successfully created your account. You can now close the browser window.</p>

      {/* <Button className="mt-6 bg-gradient-to-tr from-[#938DFB] to-[#EB004C]" size="lg">
        <ArrowLeft className="mr-2" size={20} color="white" />
        Back to app
      </Button> */}
    </div>
  );
}
