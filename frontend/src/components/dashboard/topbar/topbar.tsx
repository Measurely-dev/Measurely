'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Code, Menu, MessageSquare, Plus, User } from 'react-feather';
import FeedbackPopover from '../feedback-popover';
import AvatarDropdown from './dropdown';
import Link from 'next/link';
import { useContext } from 'react';
import { ProjectsContext, UserContext } from '@/dash-context';
import ApiDialog from '../api-dialog';
import { DrawerMenu } from './drawer-menu';
import LogoSvg from '@/components/global/logo-svg';
import { Separator } from '@/components/ui/separator';
import ProjectsChip from './projects';
import { UserRole } from '@/types';

export default function DashboardTopbar() {
  const { user } = useContext(UserContext);
  const { projects, activeProject } = useContext(ProjectsContext);

  return (
    <div className='absolute top-[0px] z-[30] flex h-[65px] w-full flex-row justify-between border-b border-accent bg-background pr-[15px] pt-[15px] max-md:fixed max-md:left-0 max-md:px-5'>
      <div className='flex h-[40px] w-full flex-row items-center justify-between'>
        <div className='flex items-center justify-center gap-4'>
          <Link href='/' className='md:hidden'>
            <LogoSvg className='size-[35px]' />
          </Link>
          <Separator className='h-[20px] md:hidden' orientation='vertical' />
          <ProjectsChip />
          <div className='max-sm:hidden'>
            {projects[activeProject].user_role !== UserRole.Guest && (
              <ApiDialog projectid={projects[activeProject]?.id ?? ''}>
                <Button
                  size={'sm'}
                  variant={'secondary'}
                  className='h-6 gap-1.5 rounded-full'
                >
                  <Code className='size-4' />
                  Api key
                </Button>
              </ApiDialog>
            )}
          </div>
        </div>
        <div className='flex flex-row gap-[12px] max-md:hidden'>
          <Link href={'/dashboard/new-metric'}>
            <Button
              className='h-[35px] gap-[8px] rounded-[12px]'
              disabled={
                projects[activeProject].user_role !== UserRole.Admin &&
                projects[activeProject].user_role !== UserRole.Owner
              }
            >
              <Plus className='size-[16px]' />
              Create metric
            </Button>
          </Link>
          <div className='max-lg:hidden'>
            <FeedbackPopover>
              <Button className='rounded-[12px]' variant={'secondary'}>
                <span className='inline-flex items-center gap-2 font-medium'>
                  <MessageSquare className='size-[16px]' />
                  Feedback
                </span>
              </Button>
            </FeedbackPopover>
          </div>
          <AvatarDropdown>
            <Avatar className='size-[35px] cursor-pointer text-secondary hover:text-primary'>
              <AvatarImage src={user.image} className='rounded-full' />
              <AvatarFallback>
                <User className='size-1/2' />
              </AvatarFallback>
            </Avatar>
          </AvatarDropdown>
        </div>

        <DrawerMenu image={user.image}>
          <Menu className='size-5' />
        </DrawerMenu>
      </div>
    </div>
  );
}
