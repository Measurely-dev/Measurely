"use client";

import AuthForm from "@/components/forms/auth";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SignIn() {
  const [error, setError] = useState("");

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <WebContainer>
      <AuthNavbar href="/sign-in" button="Sign in" />
      <ContentContainer>
        <AuthForm
          title="CreateAccount"
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
            {
              label: "Retype password",
              name: "retype",
              placeholder: "Password",
              type: "password",
            },
          ]}
          button="Register"
          forgot_password
          btn_loading={loading}
          error={error}
          action={(form) => {
            setLoading(true);
            setError('');

            const password = form.get("password");
            const retype = form.get("retype");
            const email = form.get("email");

            if (password === "" || retype === "" || email === "") {
              setError("Please enter email and password");
              return;
            }

            if (retype !== password) {
              setError("Passwords do not match");
              return;
            }

            fetch(process.env.NEXT_PUBLIC_API_URL + `/register`, {
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
