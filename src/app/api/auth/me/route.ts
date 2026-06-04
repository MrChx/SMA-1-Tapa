import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      admin: {
        id: session.admin.id,
        name: session.admin.name,
        email: session.admin.email,
        role: session.admin.role ?? "SUPER_ADMIN",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
