import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { v2 as cloudinary } from "cloudinary";

const RETENTION_DAYS = 30;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    // Query bookings older than 30 days that still have Aadhaar images
    const snapshot = await adminDb
      .collection("bookings")
      .where("createdAt", "<", cutoff)
      .get();

    let deleted = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.aadhar?.frontPublicId && !data.aadhar?.backPublicId) continue;

      // Delete images from Cloudinary
      const deletions: Promise<unknown>[] = [];

      if (data.aadhar.frontPublicId) {
        deletions.push(
          cloudinary.uploader
            .destroy(data.aadhar.frontPublicId)
            .catch(() => {/* already deleted */})
        );
      }

      if (data.aadhar.backPublicId) {
        deletions.push(
          cloudinary.uploader
            .destroy(data.aadhar.backPublicId)
            .catch(() => {/* already deleted */})
        );
      }

      await Promise.allSettled(deletions);

      // Remove aadhar data from Firestore
      await doc.ref.update({
        aadhar: null,
        aadharDeletedAt: new Date(),
      });

      deleted++;
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up Aadhaar images from ${deleted} booking(s).`,
      cutoffDate: cutoff.toISOString(),
    });
  } catch (error) {
    console.error("Aadhaar cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
