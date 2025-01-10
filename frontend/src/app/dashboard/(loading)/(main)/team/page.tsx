'use client';
import DashboardContentContainer from '@/components/dashboard/container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useContext, useEffect } from 'react';
import { TeamTable } from './team-table';
import TeamInvite from './team-invite';
import { ProjectsContext } from '@/dash-context';
import { UserRole } from '@/types';
import { toast } from 'sonner';

export default function TeamPage() {
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);

  useEffect(() => {
    document.title = 'Team | Measurely';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Collaborate with your team on Measurely. Manage roles, share insights, and work together to track and analyze metrics effectively.',
      );
    }
  }, []);

  useEffect(() => {
    const loadTeam = async () => {
      if (projects[activeProject]) {
        if (projects[activeProject].members === null) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/members/${projects[activeProject].id}`,
            { method: 'GET', credentials: 'include' },
          );

          if (response.ok) {
            const body = await response.json();
            setProjects(
              projects.map((proj, i) =>
                i === activeProject
                  ? Object.assign({}, proj, { members: body })
                  : proj,
              ),
            );
          } else {
            toast.error('Failed to load the team member list');
          }
        }
      }
    };

    loadTeam();
  }, [activeProject]);
  return (
    <DashboardContentContainer className='mt-0 flex w-full pb-[15px] pt-[15px]'>
      <Breadcrumb className='mb-5'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className='pointer-events-none'>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Team</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TeamInvite
        loading={false}
        disable={projects[activeProject].userrole === UserRole.Guest}
      />
      <div className='mt-5 h-full'>
        {projects[activeProject].members === null ? (
          <>LOADING...</>
        ) : (
          <TeamTable members={projects[activeProject].members} />
        )}
      </div>
    </DashboardContentContainer>
  );
}
