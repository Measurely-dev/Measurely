"use client";

import AuthForm from "@/components/forms/auth";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const params = useSearchParams();

  const [error, setError] = useState(params.get("error") ?? "");

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <WebContainer>
      <AuthNavbar href="/register" button="Create an account" />
      <ContentContainer>
        <AuthForm
          title="Hey friend! Welcome back"
          providers={true}
          form={[
            {
              label: "Email",
              name: "email",
              placeholder: "Email",
              type: "text",
            },
            {
              label: "Password",
              name: "password",
              placeholder: "Password",
              type: "password",
            },
          ]}
          button="Sign in"
          forgot_password
          btn_loading={loading}
          error={error}
          action={(form) => {
            setLoading(true);
            setError('');

            const password = form.get("password");
            const email = form.get("email");

            if (password === "" || email === "") {
              setError("Please enter email and password");
              return;
            }

            console.log(process.env.NEXT_PUBLIC_API_URL + `/login`);
            fetch(process.env.NEXT_PUBLIC_API_URL + `/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                email: email,
                password: password,
              }),
            })
              .then((res) => {
                if (!res.ok) {
                  res.text().then((text) => {
                    setError(text);
                  });
                } else {
                  router.push("/dashboard");
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        />
      </ContentContainer>
    </WebContainer>
  );
}
