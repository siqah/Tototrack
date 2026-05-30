import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">TotoTrack</h1>
          <p className="mt-2 text-gray-400">Every child. Every journey. Accounted for.</p>
        </div>
        <SignInForm />
        <p className="mt-4 text-center text-sm text-gray-500">
          No account?{" "}
          <a href="/sign-up" className="text-blue-400 hover:underline">
            Register as a parent
          </a>
        </p>
      </div>
    </div>
  );
}
