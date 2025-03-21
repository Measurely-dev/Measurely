"use client";

// Import required components and hooks
import AuthForm from "@/components/auth-form";
import Content from "@/components/page-content";
import SemiNavbar from "@/components/semi-navbar";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Password creation page component
export default function Password() {
  const searchParams = useSearchParams();
  const [loading, set_loading] = useState(false);
  const [back_query, set_back_query] = useState("");
  const router = useRouter();

  // Effect to handle URL parameters and build back navigation query
  useEffect(() => {
    if (
      searchParams.get("first_name") !== null &&
      searchParams.get("last_name") !== null &&
      searchParams.get("email") !== null
    ) {
      set_back_query(
        `?first_name=${searchParams.get(
          "first_name",
        )}&last_name=${searchParams.get("last_name")}&email=${searchParams.get(
          "email",
        )}`,
      );
    } else {
      redirect("/register");
    }
  }, [searchParams]);

  // Effect to set page metadata
  useEffect(() => {
    document.title = "Create Password | Measurely";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Create a secure password for your Measurely account to start tracking your metrics and analyzing your data.",
      );
    }
  }, []);

  return (
    <div className="flex flex-col">
      <SemiNavbar href={`/register${back_query}`} button="Back" />
      <Content type="page">
        <AuthForm
          title="Choose your password"
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
              name: "retyped_password",
              type: "password-normal",
            },
          ]}
          button="Continue"
          btn_loading={loading}
          action={async (formdata) => {
            set_loading(true);

            // Extract and sanitize form data
            const email = searchParams
              .get("email")
              ?.toString()
              .trim()
              .toLowerCase();
            const first_name = searchParams
              .get("first_name")
              ?.toString()
              .trim();
            const last_name = searchParams.get("last_name")?.toString().trim();
            const password = formdata.get("password")?.toString().trim();
            const retype = formdata.get("retyped_password")?.toString().trim();

            // Validate form inputs
            if (
              password === "" ||
              retype === "" ||
              email === "" ||
              first_name === "" ||
              last_name === ""
            ) {
              toast.error("Please fill in all fields");
              set_loading(false);
              return;
            }

            if (password !== retype) {
              toast.error("The passwords must be the same");
              set_loading(false);
              return;
            }

            // Submit registration request to API
            fetch(process.env.NEXT_PUBLIC_API_URL + "/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                email: email,
                first_name: first_name,
                last_name: last_name,
                password: password,
              }),
            }).then((res) => {
              if (res.ok) {
                router.push("/sign-in");
                toast.warning(
                  "We sent you an email, please verify your email address",
                );
              } else {
                res.text().then((text) => {
                  toast.error(text);
                });
                set_loading(false);
              }
            });
          }}
        />
      </Content>
    </div>
  );
}
