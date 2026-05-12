import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

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
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = file.name.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, '-');
      const fileName = `profile-${userId}-${Date.now()}-${safeName}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

      await writeFile(uploadPath, buffer);
      updateData.profileImage = `/uploads/${fileName}`;
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
  } catch (error: any) {
    console.error("Profile Header Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
