"use client";

import AuthForm from "@/components/forms/auth";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SignIn() {
  const params = useSearchParams();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("error") !== null) {
      setTimeout(() => {
        toast.error(params.get("error") as string);
      })
    }
  }, []);

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
          action={(form) => {
            setLoading(true);

            const password = form.get("password");
            const email = form.get("email");

            if (password === "" || email === "") {
              toast.error("Please enter email and password");
              setLoading(false);
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
            }).then((res) => {
              if (!res.ok) {
                res.text().then((text) => {
                  toast.error(text);
                });
                setLoading(false);
              } else {
                router.push("/dashboard");
              }
            });
          }}
        />
      </ContentContainer>
    </WebContainer>
  );
}
