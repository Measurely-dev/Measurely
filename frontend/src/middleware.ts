import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const cookie = cookies().get("log-trace-session"); 

  let logged = false;
  if (cookie !== undefined) {
    logged = true;
  }

  if (request.nextUrl.pathname.includes("dashboard") && !logged) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (request.nextUrl.pathname.includes("sign-in") && logged) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (request.nextUrl.pathname.includes("register") && logged) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/register",
    "/forgot-password",
    "/dashboard",
    "/dashboard/:appname*",
  ],
};
