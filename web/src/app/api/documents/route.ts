import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Fetch Documents Error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "Other";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Generate unique filename to avoid collisions and encoding issues
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, '-');
    const fileName = `${Date.now()}-${safeName}`;
    const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

    // Write file to public/uploads
    await writeFile(uploadPath, buffer);
    const fileUrl = `/uploads/${fileName}`; 

    const document = await prisma.document.create({
      data: {
        userId,
        name: file.name,
        type: type,
        url: fileUrl,
        extractedData: {
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          mimeType: file.type,
        },
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Ensure document belongs to user
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc || doc.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.document.delete({
      where: { id },
    });

    // Note: In a real app, you should also delete the file from disk/S3 here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
