// External and components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MetricDropdown(props: { children: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className="relative w-[150px] right-[20px] shadow-sm">
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Edit base value</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="bg-red-500/0 hover:!bg-red-500/20 transition-all !text-red-500">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
