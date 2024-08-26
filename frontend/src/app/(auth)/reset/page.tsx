"use client";

import AuthForm from "@/components/forms/auth";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import { setDefaultResultOrder } from "dns";
import { useState } from "react";

export default function PasswordReset() {
  const [view, set_view] = useState(0); // 0 : email input, 1 : sent email , 2 : password input, 3 : fail, 5 : success, 6 : loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  return (
    <WebContainer>
      <AuthNavbar href="/sign-in" button="Sign in" />

      <ContentContainer>
        {view === 0 ? (
          <AuthForm
            title="Email"
            description="Please enter the email address linked to your account"
            providers={false}
            row={[]}
            form={[
              {
                label: "Email",
                placeholder: "Email",
                name: "email",
                type: "email",
              },
            ]}
            button="Contine"
            error={error}
            btn_loading={loading}
            action={(form) => {
              setLoading(true);
              setError('')

              const email = form.get("email");
              if (email === "") {
                setError("Email is required");
              }

              fetch(process.env.NEXT_PUBLIC_API_URL + "/forgot-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: email,
                }),
                credentials: "include",
              })
                .then((res) => {
                  if (!res.ok) {
                    res.text().then((text) => {
                      setError(text);
                    });
                  } else {
                    setEmail(email?.toString() ?? "");
                    set_view(1);
                  }
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          />
        ) : (
          <></>
        )}

        {view === 2 ? (
          <AuthForm
            title="Password"
            description="Please choose a new password"
            providers={false}
            row={[]}
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
                type: "password",
              },
            ]}
            button="Reset"
            btn_loading={loading}
            error={error}
            action={(form) => {
              setLoading(true);
              setError("");

              const password = form.get("password");
              const retype = form.get("retype");

              if (password === "" || retype === "") {
                setError("Please enter password");
                return;
              }

              if (retype !== password) {
                setError("Passwords do not match");
                return;
              }

              fetch(process.env.NEXT_PUBLIC_API_URL + "/recover-account", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  password: password,
                }),
                credentials: "include",
              })
                .then((res) => {
                  if (!res.ok) {
                    res.text().then((text) => {
                      setError(text);
                    });
                  } else {
                    set_view(5);
                  }
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          />
        ) : (
          <></>
        )}
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex w-fit flex-col gap-[10px]">
            {view === 1 ? (
              <>
                <div className="text-base font-semibold">Check your email</div>
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

            {view === 6 ? "LOADING..." : <></>}

            {view === 1 || view === 3 || view === 5 ? (
              <div className="mt-[10px] text-sm">
                Need help?{" "}
                <span className="cursor-pointer font-semibold">
                  Contact support
                </span>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </ContentContainer>
    </WebContainer>
  );
}
