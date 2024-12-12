import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "z+I5$FP9#l1+Gl#PaFVJhSy$#I8fJHCO5xZSwGKWRK$t7f+I-HjDfFY@tE8G1JFS"
);

const alg = "HS256";

export async function encrypt(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);
    return token;
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

export async function decrypt(token: string | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

export async function createSession(userId: string) {
  try {
    // Create the session token
    const token = await encrypt({ userId });

    // Set the cookie
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // console.log("Session created for user:", userId);
    // console.log("Token:", token);
  } catch (error) {
    console.error("Session creation error:", error);
    throw error;
  }
}

export async function deleteSession() {
  cookies().delete("session");
}

interface Session {
  userId: string;
  // Add other session properties if needed
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get("session")?.value;
  const payload = await decrypt(token);
  return payload as Session | null;
}
