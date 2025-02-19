"use client";

// UI Component Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Context and Type Imports
import { ProjectsContext } from "@/dash-context";
import { UserRole } from "@/types";
import { roleToString } from "@/utils";

// Icon and Utility Imports
import { AtSign, UserPlus } from "lucide-react";
import { FormEvent, useContext, useId, useState } from "react";
import { toast } from "sonner";

// TeamInvite Component - Handles inviting new members to a project
export default function TeamInvite(props: {
  loading: boolean;
  disable?: boolean | false;
}) {
  // Component state
  const [inviteLoading, setInviteLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState(UserRole.Guest);
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const id = useId();

  // Handles form submission to invite a new user
  function inviteUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviteLoading(true);

    // API call to add member to project
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/member`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        member_email: email,
        project_id: projects[activeProject].id,
        role: selectedRole,
      }),
    })
      .then((resp) => {
        if (resp.status === 200) {
          toast.success("The user has been successfully added to the project");
          return resp.json();
        } else {
          resp.text().then((text) => {
            if (resp.status === 208) {
              toast.warning(text);
            } else {
              toast.error(text);
            }
          });
        }
      })
      .then((data) => {
        // Update projects context with new member if successful
        if (data !== null && data !== undefined) {
          setProjects(
            projects.map((proj, i) =>
              i === activeProject
                ? Object.assign({}, proj, {
                    members: [...(projects[activeProject].members ?? []), data],
                  })
                : proj,
            ),
          );
        }
      })
      .finally(() => {
        setInviteLoading(false);
      });
  }

  return (
    <Card className="h-fit rounded-[12px] border bg-accent dark:bg-card p-5">
      <CardContent className="p-0">
        <div className="flex flex-row items-center justify-between">
          <div className="mt-2 text-sm text-muted-foreground">
            Invite new members by email address
          </div>
        </div>
        <Separator className="my-5" />
        <form onSubmit={inviteUser}>
          <div className="flex w-full flex-row items-end gap-5 max-sm:flex-col">
            <div className="flex w-full flex-row gap-5 max-sm:flex-col">
              {/* Email Input Field */}
              <div className="flex w-full flex-col gap-3">
                <Label htmlFor={id}>Email</Label>
                <div className="relative">
                  <Input
                    id={id}
                    placeholder="Email"
                    type="email"
                    className="peer h-11 w-full rounded-[12px] ps-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <AtSign size={16} strokeWidth={2} aria-hidden="true" />
                  </div>
                </div>
              </div>
              {/* Role Selection Dropdown */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Role</Label>
                <Select
                  defaultValue={UserRole.Guest.toString()}
                  disabled={props.disable}
                >
                  <SelectTrigger
                    id="type"
                    className="h-11 w-[300px] max-w-[300px] rounded-[12px] bg-background max-lg:w-[200px] max-md:w-[150px] max-sm:w-full max-sm:max-w-none"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[UserRole.Admin, UserRole.Developer, UserRole.Guest].map(
                      (role, i) => {
                        return (
                          <SelectItem
                            key={i}
                            value={role.toString()}
                            onClick={() => setSelectedRole(role)}
                          >
                            {roleToString(role)}
                          </SelectItem>
                        );
                      },
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Submit Button or Loading Skeleton */}
            {props.loading ? (
              <>
                <Skeleton className="mt-4 flex h-9 w-fit items-center px-3 !text-transparent max-sm:w-full">
                  <UserPlus className="mr-2 size-5" />
                  Add member
                </Skeleton>
              </>
            ) : (
              <Button
                variant="outline"
                className="h-11 w-fit rounded-[12px] !bg-background text-muted-foreground max-sm:w-full sm:border"
                disabled={
                  props.disable || email === "" || inviteLoading ? true : false
                }
                loading={inviteLoading}
                type="submit"
              >
                {inviteLoading ? (
                  "Send invite"
                ) : (
                  <>
                    <UserPlus className="mr-2 size-4" />
                    Send invite
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
