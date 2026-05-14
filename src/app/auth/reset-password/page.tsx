import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Echos of Being",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
            Choose a new password
          </h1>
          <p className="text-muted">
            Enter your new password below
          </p>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
