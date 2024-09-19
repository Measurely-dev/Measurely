import DashboardContentContainer from "@/components/dashboard/container/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import WebChip from "@/components/website/components/chip";
export default function TeamPage() {
  return (
    <DashboardContentContainer className="w-full flex pb-[15px]  mt-0 h-[calc(100vh-15px-50px)] pt-[15px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="pointer-events-none">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Team</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="h-fit mt-24 w-fit mx-auto flex flex-col justify-center items-center gap-4">
        <WebChip color="default">Coming soon</WebChip>
        <div className="w-[100%] aspect-[16/7] border rounded-xl mb-4"></div>
        <div className="flex flex-col gap-3 text-center">
          <div className="font-semibold text-lg">Team</div>
          <div className="text-sm text-secondary">
            Create web-based invoices in seconds. Have an easy overview of all
            <br/>
            your invoices and see your outstanding balance.
          </div>
          <Button className="mt-4 w-fit rounded-xl mx-auto">Request feature</Button>
        </div>
      </div>
    </DashboardContentContainer>
  );
}
