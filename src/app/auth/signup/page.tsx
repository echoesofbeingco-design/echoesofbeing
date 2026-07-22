import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Echoes of Being account to book and manage your sessions.",
};

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
            A few quick details
          </h1>
          <p className="text-muted">
            It takes a moment. What you share stays private.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
