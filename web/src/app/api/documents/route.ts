import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { put, del } from "@vercel/blob";

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

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const document = await prisma.document.create({
      data: {
        userId,
        name: file.name,
        type: type,
        url: blob.url,
        extractedData: {
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          mimeType: file.type,
        },
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Upload Error:", error);
    // Provide a more helpful error message if it's a configuration issue
    const message = (error as any).message?.includes("BLOB_READ_WRITE_TOKEN")
      ? "Storage configuration missing. Please set BLOB_READ_WRITE_TOKEN."
      : "Failed to upload document";
    
    return NextResponse.json({ error: message }, { status: 500 });
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

    // Delete from Vercel Blob if it's a blob URL
    if (doc.url.includes("public.blob.vercel-storage.com")) {
      try {
        await del(doc.url);
      } catch (err) {
        console.error("Failed to delete blob:", err);
        // We continue deleting the DB record even if blob deletion fails
      }
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
