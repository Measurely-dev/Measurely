"use client";

import AuthForm from "@/components/forms/auth";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const searchParams = useSearchParams();

  const [error, set_error] = useState("");
  const [loading, set_loading] = useState(false);

  const router = useRouter();

  return (
    <WebContainer>
      <AuthNavbar href="/sign-in" button="Sign in" />
      <ContentContainer>
        <AuthForm
          title="Create your account"
          providers={true}
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
              type: "text",
            },
          ]}
          button="Create your account"
          btn_loading={loading}
          error={error}
          action={async (formdata) => {
            set_loading(true);
            set_error("");

            const email = formdata.get("email");
            const first_name = formdata.get("first_name");
            const last_name = formdata.get("last_name");

            if (email === "" || first_name === "" || last_name === "") {
              set_error("Please fill in all fields");
              set_loading(false);
              return;
            }

            fetch(process.env.NEXT_PUBLIC_API_URL + "/email-valid", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                type: 1,
              }),
              credentials: "include",
            })
              .then((res) => {
                if (!res.ok) {
                  res.text().then((text) => {
                    set_error(text);
                  });
                } else {
                  router.push(
                    `/password?email=${email}&first_name=${first_name}&last_name=${last_name}`
                  );
                }
              })
              .finally(() => {
                set_loading(false);
              });

            set_loading(false);
          }}
          policies
        />
      </ContentContainer>
    </WebContainer>
  );
}
