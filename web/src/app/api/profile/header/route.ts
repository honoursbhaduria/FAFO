import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const file = formData.get("image") as File | null;

    const updateData: any = {};
    if (name) updateData.name = name;

    if (file) {
      const blob = await put(`profiles/${userId}-${Date.now()}-${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      updateData.profileImage = blob.url;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

