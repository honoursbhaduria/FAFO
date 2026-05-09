import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    if (!prisma) {
      console.error("Prisma client not initialized");
      return NextResponse.json({ error: "Database client error" }, { status: 500 });
    }

    const { email, password } = await request.json();
    console.log("Login attempt for:", email);

    if (!email || !password) {
      console.log("Missing credentials");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check password
    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create token
    console.log("Generating JWT...");
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email },
      message: "Logged in successfully" 
    });

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ 
      error: "Failed to login", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
