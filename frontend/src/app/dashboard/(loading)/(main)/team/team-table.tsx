'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  Search,
  FileQuestion,
  ArrowBigDown,
  ArrowBigUp,
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
import { EmptyState } from '@/components/ui/empty-state';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useConfirm } from '@omit/react-confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, UserRole } from '@/types';
import { UserContext } from '@/dash-context';
import { formatFullName, roleToString } from '@/utils';

export const TeamTable = (props: { members: User[] }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useContext(UserContext);

  const itemsPerPage = 10;

  const filteredMembers = useMemo(() => {
    if (!props.members) return [];
    const filtered =
      props.members.filter((member) => {
        const matchesSearch =
          (
            member.firstname.toLowerCase() +
            ' ' +
            member.lastname.toLowerCase()
          ).includes(search.toLowerCase()) ||
          member.email.toLowerCase().includes(search.toLowerCase()) ||
          roleToString(member.userrole).includes(search.toLowerCase());

        const matchesRole =
          roleFilter === 'All' || member.userrole === roleFilter;

        return matchesSearch && matchesRole;
      }) ?? [];

    return filtered.sort((a, b) => {
      if (a.email === user.email) return -1;
      if (b.email === user.email) return 1;

      return a.userrole - b.userrole;
    });
  }, [search, props.members]);

  const paginatedMembers = useMemo(() => {
    return filteredMembers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredMembers]);

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(filteredMembers.length / itemsPerPage), 1);
  }, [filteredMembers]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  return (
    <>
      <div className='flex flex-row items-center gap-4'>
        <div className='flex w-full flex-row items-center gap-2 rounded-[12px] bg-accent pl-[12px]'>
          <Search className='size-[18px] text-secondary' />
          <Input
            className='h-[40px] w-full rounded-none border-none bg-transparent px-0 !ring-0'
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
          className='mt-2.5'
          icons={[Search, FileQuestion]}
        />
      ) : (
        <>
          <Table className='mt-2.5 overflow-hidden rounded-[16px]'>
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
const badgeClasses: { [key: string]: string } = {
  Admin:
    'bg-green-500/10 text-green-500 border !rounded-[12px] border-green-500/20',
  Owner:
    'bg-blue-500/5 text-blue-500 border !rounded-[12px] border-blue-500/20',
  Developer:
    'bg-purple-500/5 text-purple-500 border !rounded-[12px] border-purple-500/20',
  Guest:
    'bg-zinc-500/5 text-zinc-500 border !rounded-[12px] border-zinc-500/20',
};
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
                alt={`@${formatFullName(props.member.firstname, props.member.lastname)}`}
              />
              <AvatarFallback>
                {props.member.firstname.charAt(0).toUpperCase()}
                {props.member.lastname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='w-full truncate'>
              {user.id === props.member.id
                ? 'You'
                : formatFullName(props.member.firstname, props.member.lastname)}
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
              className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses[roleToString(props.member.userrole)]}`}
            >
              {roleToString(props.member.userrole)}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex w-full justify-end'>
            <MemberOption member={props.member}>
              <Button
                variant={'ghost'}
                size={'icon'}
                className='size-fit py-2 pl-2 hover:bg-transparent'
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

function FiltersComponent(props: {
  filter: 'All' | UserRole;
  setFilter: Dispatch<SetStateAction<'All' | UserRole>>;
}) {
  return (
    <Select
      value={props.filter === 'All' ? 'All' : props.filter.toString()}
      onValueChange={(value: string) => {
        if (value !== 'All') {
          props.setFilter(parseInt(value));
        } else {
          props.setFilter(value);
        }
      }}
    >
      <SelectTrigger className='w-[220px] min-w-[220px] bg-accent max-md:w-full'>
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

function MemberOption({
  children,
  member,
}: {
  children: ReactNode;
  member: User;
}) {
  const { user } = useContext(UserContext);
  const confirm = useConfirm();
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(member.email);
      toast.success(member.email + ' copied to clipboard');
    } catch (err) {
      console.error('Failed to copy email: ', err);
      toast.error('Failed to copy email');
    }
  };

  async function switchRole(props: { member: User; newRole: UserRole }) {
    const isUpgrade = props.newRole < props.member.userrole;

    const isConfirmed = await confirm({
      title: `${isUpgrade ? 'Upgrade' : 'Downgrade'} ${formatFullName(props.member.firstname, props.member.lastname)}'s role to ${roleToString(props.newRole)}`,
      icon: isUpgrade ? (
        <ArrowBigUp className='size-6 fill-green-500 text-green-500' />
      ) : (
        <ArrowBigDown className='size-6 fill-destructive text-destructive' />
      ),
      description: `Are you sure you want to ${isUpgrade ? 'upgrade' : 'downgrade'
        } ${formatFullName(props.member.firstname, props.member.lastname)}'s role to ${roleToString(props.newRole)}? This action will ${isUpgrade
          ? 'grant additional permissions'
          : 'limit their access and permissions'
        }.`,
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
      toast.success(
        `Successfully ${isUpgrade ? 'Upgraded' : 'Downgraded'} ${props.member.firstname + ' ' + props.member.lastname}'s role to ${roleToString(props.newRole)}`,
      );
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className='mr-8 w-56 rounded-[12px] shadow-md'>
        <DropdownMenuLabel>
          {formatFullName(member.firstname, member.lastname)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {member.id === user.id ? (
            <></>
          ) : (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={`rounded-[10px] ${member.userrole === UserRole.Guest || member.userrole === UserRole.Developer ? 'hidden' : ''}`}
              >
                Change role
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className='rounded-[12px]'>
                  {[UserRole.Admin, UserRole.Developer, UserRole.Guest].map(
                    (role) => {
                      return (
                        <DropdownMenuItem
                          className='rounded-[10px]'
                          disabled={member.userrole === role}
                          onClick={() =>
                            switchRole({
                              newRole: role,
                              member: member,
                            })
                          }
                        >
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses[roleToString(role)]}`}
                          >
                            {roleToString(role)}
                          </span>
                        </DropdownMenuItem>
                      );
                    },
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          <DropdownMenuItem
            onClick={handleCopyEmail}
            className='rounded-[10px]'
          >
            Copy email
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {member.userrole === UserRole.Guest ||
          member.userrole === UserRole.Developer ||
          member.id === user.id ? undefined : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className='rounded-[10px] hover:!text-destructive'>
                Remove member
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
