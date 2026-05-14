import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | Echos of Being",
  description: "Join the Echos of Being community — a safe space for healing conversations.",
};

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
            Join the community
          </h1>
          <p className="text-muted">
            A safe space to share, reflect, and be heard
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
