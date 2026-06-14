import { Suspense } from "react";
import ProfileContent from "./ProfileContent";

export const metadata = {
  title: "My Profile",
  description: "Manage your community profile, posts, and account settings.",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-cream">
      <Suspense
        fallback={
          <div className="max-w-3xl mx-auto px-6 py-16">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-secondary-bg rounded w-48" />
              <div className="h-4 bg-secondary-bg rounded w-64" />
              <div className="h-px bg-border my-8" />
              <div className="h-32 bg-secondary-bg rounded-2xl" />
              <div className="h-32 bg-secondary-bg rounded-2xl" />
            </div>
          </div>
        }
      >
        <ProfileContent />
      </Suspense>
    </main>
  );
}
