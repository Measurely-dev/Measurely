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
import { useEffect, useState } from 'react';
import { TeamTable } from './team-table';
import TeamInvite from './team-invite';

export type Role = 'Owner' | 'Admin' | 'Guest' | 'Developer';
export type TeamTableProps = {
  people: { name: string; email: string; role: Role }[];
};

const people: { name: string; email: string; role: Role }[] = [
  { name: 'Zakary Fofana', email: 'zakaryfofana@gmail.com', role: 'Owner' },
  { name: 'John Doe', email: 'johndoe@gmail.com', role: 'Admin' },
  { name: 'Jane Smith', email: 'janesmith@gmail.com', role: 'Guest' },
  { name: 'Alice Johnson', email: 'alicejohnson@gmail.com', role: 'Guest' },
  { name: 'Bob Brown', email: 'bobbrown@gmail.com', role: 'Admin' },
  { name: 'Charlie Lee', email: 'charlielee@gmail.com', role: 'Developer' },
  { name: 'Diana Wong', email: 'dianawong@gmail.com', role: 'Guest' },
  { name: 'Edward Zhang', email: 'edwardzhang@gmail.com', role: 'Guest' },
  { name: 'Fiona Davis', email: 'fionadavis@gmail.com', role: 'Developer' },
  { name: 'George Harris', email: 'georgeharris@gmail.com', role: 'Developer' },
  { name: 'Hannah Kim', email: 'hannahkim@gmail.com', role: 'Guest' },
  { name: 'Ivy Patel', email: 'ivypatel@gmail.com', role: 'Guest' },
  { name: 'Lily Evans', email: 'lilyevans@gmail.com', role: 'Developer' },
];

export default function TeamPage() {
  const [role, setRole] = useState<Role>('Developer');
  const email = 'zakaryfofana@gmail.com';

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

  const modifiedPeople = people.map((person) => ({
    ...person,
    name: person.email === email ? 'You' : person.name,
  }));

  const sortedPeople = modifiedPeople.sort((a, b) => {
    if (a.email === email) return -1;
    if (b.email === email) return 1;

    const roleOrder: Role[] = ['Owner', 'Admin', 'Developer', 'Guest'];
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

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
      <TeamInvite loading={false} disable={role === 'Guest'} />
      <div className='mt-5 h-full'>
        <TeamTable people={sortedPeople} email={email} role={role} />
      </div>
    </DashboardContentContainer>
  );
}
