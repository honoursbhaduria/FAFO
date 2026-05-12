import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function getAuthUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.userId as string;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded: any = jwt.verify(token, JWT_SECRET);
    return {
      userId: decoded.userId as string,
      role: decoded.role as string | undefined,
    };
  } catch (error) {
    return null;
  }
}
