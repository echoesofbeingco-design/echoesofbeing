import type { Metadata } from "next";
import NewPostForm from "./NewPostForm";

export const metadata: Metadata = {
  title: "Share a Thought",
};

export default function NewPostPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
          Share a thought
        </h1>
        <p className="text-muted leading-relaxed">
          This is a safe space. Share what&apos;s on your mind — you can choose
          to post anonymously if you prefer.
        </p>
      </div>
      <NewPostForm />
    </div>
  );
}
