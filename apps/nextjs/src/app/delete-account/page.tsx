import ReactMarkdown from "react-markdown";

const markdown = `
## **How to delete your account and all account data in Star Tracker app**

1. Login on your account within the app
2. Press the settings icon in the top right corner
3. Press the "Delete account" button
`;

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <article className="prose-lg">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </main>
  );
}
