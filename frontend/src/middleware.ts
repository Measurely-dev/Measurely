import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {

  const url = request.nextUrl.pathname;
  if (url === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if(url.includes("home")) {
    return;
  }

  const cookie = cookies().get("measurely-session");

  let logged = false;
  if (cookie !== undefined) {
    logged = true;
  }



  if(url.includes)

  if (url.includes("dashboard") || url.includes("new-app")) {
    if (!logged) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  } else {
    if (logged) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/register",
    "/forgot-password",
    "/new-app",
    "/dashboard",
    "/dashboard/:appname*",
  ],
};
