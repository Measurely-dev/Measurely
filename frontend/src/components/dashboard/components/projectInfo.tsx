import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Priority, Project, ProjectStatus } from '@/types';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { MoreHorizontal } from 'react-feather';
import DashSeparator from './seperator';
import Link from 'next/link';

export default function ProjectInfo({ project }: { project: Project }) {
  console.log(project);
  return (
    <Card className='flex h-full w-[375px] min-w-[375px] max-w-[375px] flex-col gap-5 rounded-2xl border-none bg-accent p-7'>
      <div className='flex h-full flex-col gap-5'>
        {/* Title and icon */}
        <div className='flex flex-row items-center justify-between'>
          <div className='flex flex-row items-center gap-2'>
            <Avatar className='size-8 bg-background'>
              <AvatarImage src={project.image ?? ''} />
              <AvatarFallback>{project.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className='text-base font-medium'>{project.name}</div>
          </div>
          <Button
            className='rounded-[12px] !bg-background hover:opacity-80'
            variant='secondary'
            size='icon'
          >
            <MoreHorizontal />
          </Button>
        </div>
        {/* Description */}
        <div className='my-[10px] text-xs text-secondary'>
          {project.description}
        </div>
        {/* Separator */}
        <DashSeparator>Properities</DashSeparator>
        <div className='flex flex-col gap-4'>
          {/* Inputs */}
          <Label className='flex flex-col gap-2'>
            Priority
            <Select defaultValue={project.priority.toString()}>
              <SelectTrigger>
                <SelectValue placeholder='Select a priority' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={Priority.High.toString()}>High</SelectItem>
                  <SelectItem value={Priority.Medium.toString()}>
                    Medium
                  </SelectItem>
                  <SelectItem value={Priority.Low.toString()}>Low</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Label>
          {/* Input 2 */}
          <Label className='flex flex-col gap-2'>
            Status
            <Select defaultValue={project.status.toString()}>
              <SelectTrigger>
                <SelectValue placeholder='Select a status' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={ProjectStatus.Completed.toString()}>
                    Completed
                  </SelectItem>
                  <SelectItem value={ProjectStatus.Ongoing.toString()}>
                    Ongoing
                  </SelectItem>
                  <SelectItem value={ProjectStatus.Todo.toString()}>
                    Todo
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Label>
        </div>
        {/* Separator */}
        <DashSeparator>Client information</DashSeparator>

        {project.client_connected ? (
          <>
            <UserInfo
              image={project.image}
              name={project.client_organisation_name}
              description={project.client_description}
            />
            {/* Separator */}
            <DashSeparator>Invoice information</DashSeparator>
            {/* Input 3 */}
            <Label className='flex flex-col gap-2'>
              Invoice reccurence
              <Select defaultValue='week'>
                <SelectTrigger>
                  <SelectValue placeholder='Select a reccurence' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='day'>Each day</SelectItem>
                    <SelectItem value='week'>Each week</SelectItem>
                    <SelectItem value='month'>Each month</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          </>
        ) : (
          'No client connected'
        )}
      </div>
      <Link
        href={`/dashboard/${project.identifier}/projects/${project.identifier}/`}
      >
        <Button className='rounded-[12px] text-sm'>View</Button>
      </Link>
    </Card>
  );
}

const UserInfo = (props: {
  image: string | null;
  name: string;
  description: string;
}) => {
  return (
    <div className='flex w-full flex-row items-center gap-[10px]'>
      <Avatar className='flex size-12 items-center justify-center bg-background text-secondary'>
        <AvatarImage src={props.image ?? ''} />
        <AvatarFallback>{props.name[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className='flex w-full flex-col gap-0.5'>
        <div className='line-clamp-1 text-sm font-medium'>{props.name}</div>
        <div className='line-clamp-1 text-[11px] text-secondary'>
          {props.description}
        </div>
      </div>
    </div>
  );
};
