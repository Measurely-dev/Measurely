"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WebContainer from "@/components/website/containers/container";
import ContentContainer from "@/components/website/containers/content";
import AuthNavbar from "@/components/website/layout/authNav/navbar";
import Footer from "@/components/website/layout/footer/footer";
import { AppsContext } from "@/dashContext";
import { Image } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, useContext, useState } from "react";
import { toast } from "sonner";

const maxSize = 500 * 1024;

export default function NewApp() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  const { setActiveApp, applications, setApplications } =
    useContext(AppsContext);

  function createApp() {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: name,
        description: description,
        file: file,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          res.text().then((text) => {
            toast.error(text);
            setLoading(false);
          });
        } else {
          return res.json();
        }
      })
      .then((json) => {
        if (file !== null) {
          const formData = new FormData();
          formData.append("file", file);

          fetch(
            process.env.NEXT_PUBLIC_FILE_URL + "/app-upload?appid=" + json.id,
            {
              method: "POST",
              credentials: "include",
              body: formData,
            }
          )
            .then((res) => {
              if (res.ok) {
                json.image = "app_" + json.id;
              }
            })
        }

        json.groups = null;
        setApplications((apps) => [...(apps ?? []), json]);
        setActiveApp(applications?.length ?? 0);
        localStorage.setItem(
          "activeApp",
          (applications?.length ?? 0).toString()
        );
        router.push("/dashboard");
      });
  }

  return (
    <div className="flex flex-col">
      <WebContainer className="h-[100vh] w-[100vw]">
        {applications === null ? (
          <AuthNavbar href="" button={null} />
        ) : (
          <AuthNavbar href="/dashboard" button="Dashboard" />
        )}
        <ContentContainer className="flex h-full items-center justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);

              if (file !== null) {
                if (file.size > maxSize) {
                  toast.error("The image is too large, MAX 500KB");
                  setLoading(false);
                  return;
                }
              }

              createApp();
            }}
          >
            {/* /Breadcrumb */}
            <div className="mx-auto flex w-[500px] flex-col gap-6 rounded-3xl">
              <div className="flex flex-col gap-[5px]">
                <div className="text-xl font-medium">
                  {applications === null
                    ? "Create your first application"
                    : "Create application"}
                </div>
                <div className="text-sm text-secondary">
                  We&apos;ll fill the billing details automatically if we find
                  the company.
                </div>
              </div>
              {/* Inputs */}
              <Inputs
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                file={file}
                setFile={setFile}
              />
              {/* Continu btn */}
              <Button
                className="w-full rounded-[12px]"
                type="submit"
                loading={loading}
                disabled={loading || name === ""}
              >
                Create application
              </Button>
              {/* </Link> */}
            </div>
          </form>
        </ContentContainer>
      </WebContainer>
      <Footer border bg="secondary" />
    </div>
  );
}

function Inputs(props: {
  name: string;
  setName: Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<React.SetStateAction<string>>;
  file: any;
  setFile: Dispatch<React.SetStateAction<any>>;
}) {
  const [reader, setReader] = useState<any>(null);

  return (
    <div className="flex flex-col gap-[15px]">
      {/* Name */}
      <div className="flex w-full items-center gap-5">
        <Avatar className="relative size-[65px] cursor-pointer items-center justify-center !rounded-[16px] overflow-visible ">
          <Label className="relative h-full w-full cursor-pointer">
            <AvatarImage className="rounded-[16px]" src={reader} />
            <AvatarFallback className="!rounded-[16px] w-full h-full">
              <Image className="text-secondary" />
            </AvatarFallback>
            <Input
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];

                if (!selectedFile) {
                  return;
                }

                const r = new FileReader();

                r.onload = (e) => {
                  setReader(e.target?.result);
                };

                r.readAsDataURL(selectedFile);
                props.setFile(event.target.files?.[0]);
              }}
              type="file"
              accept=".jpg, .jpeg, .png, .webp .svg"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </Label>
        </Avatar>
        <Label className="flex w-full flex-col gap-2">
          Name
          <Input
            value={props.name}
            type="text"
            onChange={(e) => props.setName(e.target.value)}
            className="h-[40px] rounded-[12px] border-none bg-accent"
            placeholder="Name..."
          />
        </Label>
      </div>
    </div>
  );
}
