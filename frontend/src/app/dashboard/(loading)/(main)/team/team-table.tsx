'use client';

// Import UI components and utilities
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
  FloatingPanelBody,
  FloatingPanelButton,
  FloatingPanelContent,
  FloatingPanelRoot,
  FloatingPanelSubMenu,
  FloatingPanelTrigger,
} from '@/components/ui/floating-panel';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProjectsContext, UserContext } from '@/dash-context';
import { User, UserRole } from '@/types';
import { formatFullName, roleToString } from '@/utils';
import { useConfirm } from '@omit/react-confirm-dialog';
import {
  ArrowBigDown,
  ArrowBigUp,
  FileQuestion,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
  UserCog,
} from 'lucide-react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Trash, UserCheck, UserX } from 'react-feather';
import { toast } from 'sonner';

// Main team table component that displays member list with filtering and pagination
export const TeamTable = (props: { members: User[] }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useContext(UserContext);
  const itemsPerPage = 10;

  // Filter and sort members based on search term and role filter
  const filteredMembers = useMemo(() => {
    if (!props.members) return [];
    const filtered = props.members.filter((member) => {
      const matchesSearch =
        (
          member.first_name.toLowerCase() +
          ' ' +
          member.last_name.toLowerCase()
        ).includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()) ||
        roleToString(member.user_role)
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === 'All' || member.user_role === roleFilter;

      return matchesSearch && matchesRole;
    });

    return filtered.sort((a, b) => {
      if (a.email === user.email) return -1;
      if (b.email === user.email) return 1;
      return a.user_role - b.user_role;
    });
  }, [search, props.members, roleFilter]);

  // Get paginated members for current page
  const paginatedMembers = useMemo(() => {
    return filteredMembers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredMembers]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(filteredMembers.length / itemsPerPage), 1);
  }, [filteredMembers]);

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <>
      <div className='mb-2.5 flex flex-row items-center gap-4 max-md:flex-col'>
        <div className='flex w-full flex-row items-center gap-2 rounded-[12px] border pl-[12px] shadow-sm shadow-black/5'>
          <Search className='size-[18px] text-secondary' />
          <Input
            className='h-[40px] w-full rounded-none border-none bg-transparent px-0 shadow-none !ring-0'
            placeholder='Search member...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FiltersComponent filter={roleFilter} setFilter={setRoleFilter} />
      </div>

      {filteredMembers.length === 0 ? (
        <EmptyState
          title='No Results Found'
          description='Try adjusting your search filters.'
          icons={[Search, FileQuestion]}
        />
      ) : (
        <>
          <Table className='overflow-hidden rounded-[16px]'>
            <TableHeader>
              <TableRow className='bg-accent/60'>
                <TableHead colSpan={2}>Member</TableHead>
                <TableHead colSpan={3} className='text-nowrap'>
                  Email
                </TableHead>
                <TableHead className='text-nowrap' colSpan={1.5}>
                  Role
                </TableHead>
                <TableHead className='w-[50px] text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member, index) => (
                  <Item key={index} member={member} />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center text-muted-foreground'
                  >
                    No results on this page. Adjust your search or filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>Total</TableCell>
                <TableCell className='text-right'>
                  {paginatedMembers.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <Pagination className='mt-auto w-full py-3 pt-6'>
            <PaginationContent className='flex w-full items-center justify-between'>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none text-muted-foreground opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
              <div className='flex items-center gap-2'>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href='#'
                      isActive={currentPage === index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </div>
              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={() =>
                    setCurrentPage(Math.min(currentPage + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </>
  );
};

// Style definitions for role badges
const badgeClasses: { [key: string]: string } = {
  Owner:
    'bg-green-500/10 text-green-500 border !rounded-[12px] border-green-500/20',
  Admin:
    'bg-blue-500/5 text-blue-500 border !rounded-[12px] border-blue-500/20',
  Developer:
    'bg-purple-500/5 text-purple-500 border !rounded-[12px] border-purple-500/20',
  Guest:
    'bg-zinc-500/5 text-zinc-500 border !rounded-[12px] border-zinc-500/20',
};

// Individual member row component
const Item = (props: { member: User }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <>
      <TableRow>
        <TableCell className='font-medium' colSpan={2}>
          <div className='flex flex-row items-center gap-[10px] truncate text-[15px]'>
            <Avatar className='size-9'>
              <AvatarImage
                src={props.member.image}
                alt={`@${formatFullName(props.member.first_name, props.member.last_name)}`}
              />
              <AvatarFallback>
                {props.member.first_name.charAt(0).toUpperCase()}
                {props.member.last_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='w-full truncate'>
              {user.id === props.member.id
                ? 'You'
                : formatFullName(
                    props.member.first_name,
                    props.member.last_name,
                  )}
            </div>
          </div>
        </TableCell>
        <TableCell colSpan={3}>
          <div className='my-auto line-clamp-1 h-fit w-full items-center font-mono text-[15px] text-secondary'>
            {props.member.email}
          </div>
        </TableCell>
        <TableCell colSpan={1.5}>
          <div className='my-auto line-clamp-1 h-fit w-full items-center font-mono text-[15px]'>
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses[roleToString(props.member.user_role)]}`}
            >
              {roleToString(props.member.user_role)}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex w-full justify-end'>
            <MemberOption member={props.member}>
              <Button
                variant={'ghost'}
                size={'icon'}
                className='size-9 hover:bg-transparent'
              >
                <MoreHorizontal className='size-5' />
              </Button>
            </MemberOption>
          </div>
        </TableCell>
      </TableRow>

      {openDialog && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Role filter component
function FiltersComponent(props: {
  filter: 'All' | UserRole;
  setFilter: Dispatch<SetStateAction<'All' | UserRole>>;
}) {
  return (
    <Select
      value={props.filter === 'All' ? 'All' : props.filter.toString()}
      onValueChange={(value: string) => {
        props.setFilter(value === 'All' ? value : parseInt(value));
      }}
    >
      <SelectTrigger className='w-[220px] min-w-[220px] max-md:w-full'>
        <SelectValue placeholder='Select role' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort by role</SelectLabel>
          <SelectSeparator />
          <SelectItem value='All'>All roles</SelectItem>
          <SelectItem value='0'>Owner</SelectItem>
          <SelectItem value='1'>Admin</SelectItem>
          <SelectItem value='2'>Developer</SelectItem>
          <SelectItem value='3'>Guest</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// Member options menu component
function MemberOption({
  children,
  member,
}: {
  children: ReactNode;
  member: User;
}) {
  const { user } = useContext(UserContext);
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);

  // Handle copying member email
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(member.email);
      toast.success(member.email + ' copied to clipboard');
    } catch (err) {
      console.error('Failed to copy email: ', err);
      toast.error('Failed to copy email');
    }
  };

  // Handle role change for member
  async function switchRole(member: User, newRole: UserRole) {
    const isUpgrade = newRole < member.user_role;

    const isConfirmed = await confirm({
      title: `${isUpgrade ? 'Upgrade' : 'Downgrade'} ${formatFullName(member.first_name, member.last_name)}'s role to ${roleToString(newRole)}`,
      icon: isUpgrade ? (
        <ArrowBigUp className='size-6 fill-green-500 text-green-500' />
      ) : (
        <ArrowBigDown className='size-6 fill-destructive text-destructive' />
      ),
      description: `Are you sure you want to ${isUpgrade ? 'upgrade' : 'downgrade'} ${formatFullName(member.first_name, member.last_name)}'s role to ${roleToString(newRole)}? This action will ${isUpgrade ? 'grant additional permissions' : 'limit their access and permissions'}.`,
      confirmText: `Yes, ${isUpgrade ? 'upgrade' : 'downgrade'}`,
      cancelText: 'Cancel',
      cancelButton: {
        size: 'default',
        variant: 'outline',
        className: 'rounded-[12px]',
      },
      confirmButton: {
        className: isUpgrade
          ? 'bg-green-500 hover:bg-green-600 text-white rounded-[12px]'
          : 'bg-red-500 hover:bg-red-600 text-white rounded-[12px]',
      },
      alertDialogTitle: {
        className: 'flex items-center gap-1',
      },
      alertDialogContent: {
        className: '!rounded-[16px]',
      },
    });

    if (isConfirmed) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'authorization/json',
        },
        body: JSON.stringify({
          member_id: member.id,
          project_id: projects[activeProject].id,
          new_role: newRole,
        }),
      }).then((resp) => {
        if (resp.ok) {
          toast.success(
            `Successfully ${isUpgrade ? 'Upgraded' : 'Downgraded'} ${formatFullName(member.first_name, member.last_name)}'s role to ${roleToString(newRole)}`,
          );
          setProjects(
            projects.map((proj, i) =>
              i === activeProject
                ? Object.assign({}, proj, {
                    members: (proj.members ?? []).map((m) =>
                      m.id === member.id
                        ? Object.assign({}, m, { user_role: newRole })
                        : m,
                    ),
                  })
                : proj,
            ),
          );
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
      });
    }
  }

  // Handle member removal
  async function deleteMember(member: User) {
    const isConfirmed = await confirm({
      title: `Remove ${formatFullName(member.first_name, member.last_name)} from the project`,
      icon: <Trash2 className='size-5 text-destructive' />,
      description: `Are you sure you want to remove ${formatFullName(member.first_name, member.last_name)} from the project? This action will permanently remove the user's access to the project.`,
      confirmText: `Yes`,
      cancelText: 'Cancel',
      cancelButton: {
        size: 'default',
        variant: 'outline',
        className: 'rounded-[12px]',
      },
      confirmButton: {
        className: 'bg-red-500 hover:bg-red-600 text-white rounded-[12px]',
      },
      alertDialogTitle: {
        className: 'flex items-center gap-2',
      },
      alertDialogContent: {
        className: '!rounded-[16px]',
      },
    });

    if (isConfirmed) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/member`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'authorization/json',
        },
        body: JSON.stringify({
          member_id: member.id,
          project_id: projects[activeProject].id,
        }),
      }).then((resp) => {
        if (resp.ok) {
          toast.success(
            `Successfully removed ${formatFullName(member.first_name, member.last_name)} from the project`,
          );
          setProjects(
            projects.map((proj, i) =>
              i === activeProject
                ? Object.assign({}, proj, {
                    members: (proj.members ?? []).filter(
                      (m) => m.id !== member.id,
                    ),
                  })
                : proj,
            ),
          );
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
      });
    }
  }

  return (
    <FloatingPanelRoot open={open} onOpenChange={setOpen}>
      <FloatingPanelTrigger
        title={formatFullName(member.first_name, member.last_name)}
        className='relative'
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </FloatingPanelTrigger>
      <FloatingPanelContent
        className='w-[200px] rounded-lg border border-zinc-950/10 bg-white shadow-sm dark:border-zinc-50/10 dark:bg-zinc-800'
        side='right'
      >
        <FloatingPanelBody className='p-1'>
          {(projects[activeProject].user_role === UserRole.Admin ||
            (projects[activeProject].user_role === UserRole.Owner &&
              member.id !== user.id) ||
            (projects[activeProject].user_role !== UserRole.Owner &&
              member.id === user.id)) && (
            <FloatingPanelSubMenu title='Change Role'>
              <FloatingPanelButton
                disabled={member.user_role === UserRole.Admin}
                className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
                onClick={() => {
                  switchRole(member, UserRole.Admin);
                  setOpen(false);
                }}
              >
                <UserCog className='size-4' />
                <span>Admin</span>
              </FloatingPanelButton>
              <FloatingPanelButton
                disabled={member.user_role === UserRole.Developer}
                className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
                onClick={() => {
                  switchRole(member, UserRole.Developer);
                  setOpen(false);
                }}
              >
                <UserCheck className='size-4' />
                <span>Developer</span>
              </FloatingPanelButton>
              <FloatingPanelButton
                disabled={member.user_role === UserRole.Guest}
                className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
                onClick={() => {
                  switchRole(member, UserRole.Guest);
                  setOpen(false);
                }}
              >
                <UserX className='size-4' />
                <span>Guest</span>
              </FloatingPanelButton>
            </FloatingPanelSubMenu>
          )}
          <FloatingPanelButton
            className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
            onClick={(e: React.MouseEvent) => {
              handleCopyEmail();
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <Mail className='size-4' />
            <span>Copy email</span>
          </FloatingPanelButton>

          {(projects[activeProject].user_role === UserRole.Admin ||
            (projects[activeProject].user_role === UserRole.Owner &&
              member.id !== user.id) ||
            (projects[activeProject].user_role !== UserRole.Owner &&
              member.id === user.id)) && (
            <>
              <div className='my-1 h-px bg-zinc-950/10 dark:bg-zinc-50/10' />
              <FloatingPanelButton
                className='flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 text-left text-red-500 transition-colors hover:bg-red-500/20'
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  deleteMember(member);
                  setOpen(false);
                }}
              >
                <Trash className='size-4' />
                <span>Remove member</span>
              </FloatingPanelButton>
            </>
          )}
        </FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}
