import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RecentProjectCard(props: { projects: Array<any> }) {
  return (
    <Card className='flex h-full min-w-[35%] flex-col gap-[10px] rounded-2xl border-none bg-accent p-5'>
      <div className='mb-[10px] flex flex-col gap-[5px]'>
        <div className='text-base font-medium'>Recent projects</div>
        <div className='text-xs text-secondary'>
          See a preview of all your recent projects
        </div>
      </div>
      <div className='flex h-full flex-col gap-[15px]'>
        {props.projects.map((project, i) => {
          return (
            <RecentProjectItem
              key={i}
              name={project.name}
              pfp={project.pfp}
              status={project.status}
            />
          );
        })}
      </div>
      <Button className='rounded-[12px] mt-2'>View all projects</Button>
    </Card>
  );
}

function RecentProjectItem(props: {
  name: string;
  pfp: string;
  status: 'progress' | 'todo' | 'done';
}) {
  const render = () => {
    switch (props.status) {
      case 'done':
        return (
          <Badge className='pointer-events-none rounded-full bg-green-100 font-medium text-green-500 shadow-none'>
            Finished
          </Badge>
        );
      case 'progress':
        return (
          <Badge className='pointer-events-none rounded-full bg-yellow-100 font-medium text-yellow-500 shadow-none'>
            In progress
          </Badge>
        );
      case 'todo':
        return (
          <Badge className='pointer-events-none rounded-full bg-zinc-100 font-medium text-zinc-500 shadow-none'>
            Todo
          </Badge>
        );
    }
  };

  return (
    <div className='relative w-full items-center justify-between rounded-[16px] bg-background px-[10px] py-[8px]'>
      <div className='flex flex-row items-center gap-[10px]'>
        <Avatar className='size-8 border bg-accent'>
          <AvatarImage src={props.pfp} />
        </Avatar>
        <div className='text-[14px] font-medium'>{props.name}</div>
      </div>
      <div className='absolute -top-[10px] right-5'>{render()}</div>
    </div>
  );
}
