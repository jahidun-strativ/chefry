/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Preview staging app",
};

export default function PreviewAppPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto flex w-full max-w-lg flex-col p-6">
        <h1 className="text-center text-4xl font-bold">Star Tracker preview staging</h1>

        <a
          href="exp://u.expo.dev/0a16acb0-666e-4b5c-911f-a04ffd800ccb?channel-name=staging&runtime-version=exposdk%3A49.0.0"
          className="mt-12 rounded-lg bg-slate-900 p-6 text-center text-xl font-semibold text-white"
        >
          <div className="flex items-center justify-center">
            <ExternalLink size={26} className="mr-3" />
            Open the app in Expo Go
          </div>
        </a>

        <div className="my-8 text-center text-xl font-semibold">Or scan the QR code if you&apos;re not a mobile device</div>
        <div className="rounded-lg bg-white p-0 shadow-lg">
          <img
            src="https://qr.expo.dev/eas-update?appScheme=exp&amp;projectId=0a16acb0-666e-4b5c-911f-a04ffd800ccb&amp;channel=staging&amp;runtimeVersion=exposdk%3A49.0.0&amp;host=u.expo.dev"
            alt="App preview QR code"
            className="h-full w-full"
          />
        </div>
      </div>
    </main>
  );
}
