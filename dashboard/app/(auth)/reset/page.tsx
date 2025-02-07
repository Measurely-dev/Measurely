"use client";

// Import required components and hooks
import AuthForm from "@/components/auth-form";
import Content from "@/components/page-content";
import SemiNavbar from "@/components/semi-navbar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

// Password reset component that handles the complete password reset flow
export default function PasswordReset() {
  const searchParams = useSearchParams();
  // View states: 0-email input, 1-sent email, 2-password input, 3-fail, 5-success, 6-loading
  const [view, setView] = useState(6);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Check for reset code in URL and set appropriate view
  useEffect(() => {
    if (searchParams.get("code") !== null) {
      setView(2);
    } else {
      setView(0);
    }
  }, [searchParams]);

  // Set page metadata
  useEffect(() => {
    document.title = "Reset password | Measurely";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Reset your password and regain access to your Measurely account to manage your metrics and data.",
      );
    }
  }, []);

  return (
    <div className="flex flex-col">
      <div className="">
        <SemiNavbar href="/sign-in" button="Sign in" />
      </div>
      <Content type="page">
        {/* Email input form view */}
        {view === 0 ? (
          <AuthForm
            title="Forgot password?"
            description="Please enter the email address linked to your account"
            providers={false}
            form={[
              {
                label: "Email",
                placeholder: "Email",
                name: "email",
                type: "email",
              },
            ]}
            button="Send"
            btn_loading={loading}
            action={(form) => {
              setLoading(true);
              const email = form.get("email")?.toString().trim().toLowerCase();
              if (email === "") {
                toast.error("Email is required");
                setLoading(false);
                return;
              }
              // Send password reset request to API
              fetch(process.env.NEXT_PUBLIC_API_URL + "/forgot_password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: email,
                }),
                credentials: "include",
              }).then((res) => {
                if (!res.ok) {
                  res.text().then((text) => {
                    toast.error(text);
                  });
                  setLoading(false);
                } else {
                  setEmail(email ?? "");
                  setView(1);
                }
              });
            }}
          />
        ) : (
          <></>
        )}

        {/* New password input form view */}
        {view === 2 ? (
          <AuthForm
            title="Password"
            description="Please choose a new password"
            providers={false}
            form={[
              {
                label: "Password",
                placeholder: "Password",
                name: "password",
                type: "password",
              },
              {
                label: "Retype password",
                placeholder: "Password",
                name: "retype",
                type: "password-normal",
              },
            ]}
            button="Reset"
            btn_loading={loading}
            action={(form) => {
              setLoading(true);

              const password = form.get("password");
              const retype = form.get("retype");

              // Validate password inputs
              if (password === "" || retype === "") {
                toast.error("Password is required");
                return;
              }

              if (retype !== password) {
                toast.error("Passwords do not match");
                return;
              }

              // Submit new password to API
              fetch(process.env.NEXT_PUBLIC_API_URL + "/recover_account", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  new_password: password,
                  request_id: searchParams.get("code"),
                }),
                credentials: "include",
              }).then((res) => {
                if (!res.ok) {
                  res.text().then((text) => {
                    toast.error(text);
                  });
                  setLoading(false);
                } else {
                  setView(5);
                }
              });
            }}
          />
        ) : (
          <></>
        )}

        {/* Status messages container */}
        <div className="flex w-full items-center justify-center">
          <div className="flex w-fit flex-col gap-[10px]">
            {/* Email sent confirmation view */}
            {view === 1 ? (
              <>
                <div className="mt-20 text-base font-semibold">
                  Check your email
                </div>
                <div className="mt-[10px] text-sm">
                  We emailed a magic link to{" "}
                  <span className="font-semibold">
                    {email ?? "unknown@mail.com"}
                  </span>
                  .
                  <br />
                  Proceed by opening the link.
                </div>
              </>
            ) : (
              <></>
            )}

            {/* Error view */}
            {view === 3 ? (
              <>
                <div className="text-base font-semibold">
                  Failed to reset your password
                </div>
                <div className="mt-[10px] text-sm">
                  the link might be invalid or expired
                </div>
              </>
            ) : (
              <></>
            )}

            {/* Success view */}
            {view === 5 ? (
              <>
                <div className="text-base font-semibold">
                  Your password has been reset
                </div>
                <div className="mt-[10px] text-sm">
                  You can now sign in with your new password
                </div>
              </>
            ) : (
              <></>
            )}

            {/* Loading view */}
            {view === 6 ? <Loader className="size-8 animate-spin" /> : <></>}

            {/* Support link for specific views */}
            {view === 1 || view === 3 || view === 5 ? (
              <div className="mt-[10px] text-sm">
                Need help?{" "}
                <a
                  href="mailto:info@measurely.dev"
                  className="cursor-pointer font-semibold"
                >
                  Contact support
                </a>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </Content>
    </div>
  );
}
