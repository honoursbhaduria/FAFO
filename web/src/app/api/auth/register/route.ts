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
    
    const body = await request.json();
    const { name, email, password, role, consultantProfile } = body;
    console.log("Registration attempt:", { name, email, role });

    if (!email || !password || !name) {
      console.log("Missing fields in registration");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    console.log("Creating user in DB with role:", role || "USER");
    
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "USER",
          ...(role === "CONSULTANT" && consultantProfile ? {
            consultantProfile: {
              create: {
                title: consultantProfile.title || "Chartered Accountant",
                specialization: consultantProfile.specialization || [],
                experience: parseInt(consultantProfile.experience) || 0,
                qualification: consultantProfile.qualification || "",
                licenseNumber: consultantProfile.licenseNumber || "",
                bio: consultantProfile.bio || "",
                location: consultantProfile.location || "",
                phone: consultantProfile.phone || "",
                website: consultantProfile.website || "",
                hourlyRate: consultantProfile.hourlyRate || "₹999/session",
                verified: false,
              }
            }
          } : {})
        },
      });

      console.log("User created successfully:", user.id);
      // Create token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

      const response = NextResponse.json({ 
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        hasProfile: role === "CONSULTANT",
        message: "User created successfully" 
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
    } catch (dbError: any) {
      console.error("Prisma Creation Error:", dbError);
      return NextResponse.json({ 
        error: "Database error during registration", 
        details: dbError.message,
        code: dbError.code 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ 
      error: "Failed to register user", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
