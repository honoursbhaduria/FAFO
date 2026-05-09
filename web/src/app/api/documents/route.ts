import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Mock User ID for demonstration (since auth isn't fully implemented in this flow yet)
const MOCK_USER_ID = "cm0v3x..."; // This would normally come from session

export async function GET() {
  try {
    // In a real app, we'd get the current user's ID from the session
    // For now, let's find the first user in the DB to associate documents with
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      return NextResponse.json({ documents: [] });
    }

    const documents = await prisma.document.findMany({
      where: { userId: firstUser.id },
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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "Other";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Get the first user to associate the document with
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      return NextResponse.json({ error: "No user found to associate document with" }, { status: 404 });
    }

    // In a production app, you'd upload the file to S3, Cloudinary, or Vercel Blob
    // Here we'll simulate the URL and save metadata to the DB
    const mockUrl = `/uploads/${file.name}`; 

    const document = await prisma.document.create({
      data: {
        userId: firstUser.id,
        name: file.name,
        type: type,
        url: mockUrl,
        // Mocking some extracted data for the AI features
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
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
