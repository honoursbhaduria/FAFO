import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "CONSULTANT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const profile = await prisma.consultantProfile.findUnique({
      where: { userId: auth.userId },
    });

    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("Fetch Consultant Profile Error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "CONSULTANT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const {
      title,
      specialization,
      experience,
      qualification,
      licenseNumber,
      bio,
      location,
      phone,
      website,
      hourlyRate,
      resumeUrl,
    } = body;

    if (!licenseNumber || !qualification) {
      return NextResponse.json({ error: "License number and qualification are required" }, { status: 400 });
    }

    const profile = await prisma.consultantProfile.upsert({
      where: { userId: auth.userId },
      update: {
        title,
        specialization: specialization || [],
        experience: parseInt(String(experience)) || 0,
        qualification,
        licenseNumber,
        bio,
        location,
        phone,
        website,
        hourlyRate,
        resumeUrl,
      },
      create: {
        userId: auth.userId,
        title: title || "Chartered Accountant",
        specialization: specialization || [],
        experience: parseInt(String(experience)) || 0,
        qualification: qualification || "",
        licenseNumber: licenseNumber || "",
        bio: bio || "",
        location: location || "",
        phone: phone || "",
        website: website || "",
        hourlyRate: hourlyRate || "₹999/session",
        resumeUrl: resumeUrl || null,
        verified: false,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Save Consultant Profile Error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
