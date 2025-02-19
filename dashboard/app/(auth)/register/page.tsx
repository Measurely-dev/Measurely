"use client";

// Import required components and dependencies
import AuthForm from "@/components/auth-form";
import Content from "@/components/page-content";
import SemiNavbar from "@/components/semi-navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Measurely from "measurely-js";

// Registration page component
export default function Register() {
  const searchParams = useSearchParams();
  const [loading, set_loading] = useState(false);
  const router = useRouter();

  // Set page metadata and initialize analytics on mount
  useEffect(() => {
    // Update page title and meta description
    document.title = "Register | Measurely";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Create a Measurely account to start tracking your metrics and gain insights for your projects and teams.",
      );
    }

    // Initialize analytics in production environment
    if (process.env.NEXT_PUBLIC_ENV === "production") {
      Measurely.init(process.env.NEXT_PUBLIC_MEASURELY_API_KEY ?? "");
      Measurely.capture("b3c58d0d-f1af-4c34-84ed-0450cd93e844", {
        value: 1,
        filters: {},
      });
    }
  }, []);

  return (
    <div className="flex flex-col">
      <div className="mb-[150px]">
        <SemiNavbar href="/sign-in" button="Sign in" />
      </div>
      <Content className="pb-[100px]">
        <AuthForm
          title="Create an account"
          providers={true}
          // Form field configurations with default values from URL params
          form={[
            {
              label: "First name",
              name: "first_name",
              default: searchParams.get("first_name") ?? "",
              placeholder: "First name",
              type: "text",
            },
            {
              label: "Last name",
              name: "last_name",
              default: searchParams.get("last_name") ?? "",
              placeholder: "Last name",
              type: "text",
            },
            {
              label: "Email ",
              name: "email",
              default: searchParams.get("email") ?? "",
              placeholder: "Email",
              type: "email",
            },
          ]}
          button="Create your account"
          btn_loading={loading}
          // Form submission handler
          action={async (formdata) => {
            set_loading(true);

            // Process and normalize form input
            const email = formdata
              .get("email")
              ?.toString()
              .trim()
              .toLowerCase();
            const first_name = formdata
              .get("first_name")
              ?.toString()
              .trimStart()
              .toLowerCase();
            const last_name = formdata
              .get("last_name")
              ?.toString()
              .trimStart()
              .toLowerCase();

            // Validate required fields
            if (email === "" || first_name === "" || last_name === "") {
              toast.error("Please fill in all fields");
              set_loading(false);
              return;
            }

            // Validate email with backend API
            fetch(process.env.NEXT_PUBLIC_API_URL + "/email_valid", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                type: 1,
              }),
              credentials: "include",
            }).then((res) => {
              if (!res.ok) {
                res.text().then((text) => {
                  toast.error(text);
                });
                set_loading(false);
              } else {
                router.push(
                  `/password?email=${email}&first_name=${first_name}&last_name=${last_name}`,
                );
              }
            });
          }}
          policies
        />
      </Content>
    </div>
  );
}
