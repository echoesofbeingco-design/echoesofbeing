import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// POST: Create a new booking (+ auto-link/create client)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action } = data;

    // ── Create booking ──
    if (action === "create") {
      const {
        name,
        email,
        whatsapp,
        age,
        gender,
        pronouns,
        sessionType,
        category,
        concern,
      } = data;

      if (!name || !email || !whatsapp) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const now = FieldValue.serverTimestamp();

      // 1. Create the booking
      const bookingRef = await adminDb.collection("bookings").add({
        name,
        email,
        whatsapp,
        age: age || "",
        gender: gender || "",
        pronouns: pronouns || "",
        sessionType: sessionType || "",
        category: category || "",
        concern: concern || "",
        status: "intake_submitted",
        createdAt: now,
        updatedAt: now,
      });

      // 2. Create or link a client record
      const clientsSnap = await adminDb
        .collection("clients")
        .where("email", "==", email.toLowerCase().trim())
        .limit(1)
        .get();

      if (clientsSnap.empty) {
        const clientRef = await adminDb.collection("clients").add({
          name,
          email: email.toLowerCase().trim(),
          whatsapp,
          age: age || "",
          gender: gender || "",
          pronouns: pronouns || "",
          occupation: "",
          desiredOutcomes: "",
          status: "active",
          bookingId: bookingRef.id,
          createdAt: now,
          updatedAt: now,
        });

        await bookingRef.update({ clientId: clientRef.id });
      } else {
        const existingClient = clientsSnap.docs[0];
        await bookingRef.update({ clientId: existingClient.id });
      }

      return NextResponse.json({ id: bookingRef.id });
    }

    // ── Update Aadhaar data ──
    if (action === "update_aadhar") {
      const { bookingId, aadhar } = data;
      if (!bookingId || !aadhar) {
        return NextResponse.json(
          { error: "Missing booking ID or Aadhaar data" },
          { status: 400 }
        );
      }

      await adminDb.collection("bookings").doc(bookingId).update({
        aadhar,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    // ── Update Calendly data ──
    if (action === "update_calendly") {
      const { bookingId, calendly } = data;
      if (!bookingId) {
        return NextResponse.json(
          { error: "Missing booking ID" },
          { status: 400 }
        );
      }

      await adminDb.collection("bookings").doc(bookingId).update({
        calendly: calendly || {},
        status: "slot_reserved",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    // ── Update consent ──
    if (action === "update_consent") {
      const { bookingId, consent } = data;
      if (!bookingId) {
        return NextResponse.json(
          { error: "Missing booking ID" },
          { status: 400 }
        );
      }

      await adminDb.collection("bookings").doc(bookingId).update({
        consent: consent || {},
        status: "pending_payment",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    // ── Get booking ──
    if (action === "get") {
      const { bookingId } = data;
      if (!bookingId) {
        return NextResponse.json(
          { error: "Missing booking ID" },
          { status: 400 }
        );
      }

      const snap = await adminDb.collection("bookings").doc(bookingId).get();
      if (!snap.exists) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      const bookingData = snap.data();
      // Convert Firestore Timestamps to ISO strings for the client
      const serialized = {
        id: snap.id,
        ...bookingData,
        createdAt: bookingData?.createdAt?.toDate?.()?.toISOString?.() || bookingData?.createdAt || "",
        updatedAt: bookingData?.updatedAt?.toDate?.()?.toISOString?.() || bookingData?.updatedAt || "",
      };

      return NextResponse.json({ booking: serialized });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
