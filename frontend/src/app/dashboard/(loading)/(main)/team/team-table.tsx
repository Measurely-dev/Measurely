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
import { MoreHorizontal, Search, FileQuestion } from 'lucide-react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
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
import { Person, Role, TeamTableProps } from './page';
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

export const TeamTable = ({
  people,
  email,
  role,
}: TeamTableProps & { email: string; role: Role }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | Role>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.email.toLowerCase().includes(search.toLowerCase()) ||
      person.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'All' || person.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const sortedPeople = filteredPeople.sort((a, b) => {
    if (a.email === email) return -1;
    if (b.email === email) return 1;

    const roleOrder: Role[] = ['Owner', 'Admin', 'Developer', 'Guest'];
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  const paginatedPeople = sortedPeople.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.max(Math.ceil(sortedPeople.length / itemsPerPage), 1);
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
      {filteredPeople.length === 0 ? (
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
              {paginatedPeople.length > 0 ? (
                paginatedPeople.map((person, index) => (
                  <Item key={index} person={person} role={role} />
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
                  {paginatedPeople.length}
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
const badgeClasses: { [key in Role]: string } = {
  Owner:
    'bg-green-500/10 text-green-500 border !rounded-[12px] border-green-500/20',
  Admin:
    'bg-blue-500/5 text-blue-500 border !rounded-[12px] border-blue-500/20',
  Developer:
    'bg-purple-500/5 text-purple-500 border !rounded-[12px] border-purple-500/20',
  Guest:
    'bg-zinc-500/5 text-zinc-500 border !rounded-[12px] border-zinc-500/20',
};
const Item = ({ person, role }: { person: Person; role: Role }) => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className='font-medium' colSpan={2}>
          <div className='flex flex-row items-center gap-[10px] truncate text-[15px]'>
            <Avatar className='size-9'>
              <AvatarImage src={person.pfp} alt={`@${person.name}`} />
              <AvatarFallback>
                {person.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='w-full truncate'>{person.name}</div>
          </div>
        </TableCell>
        <TableCell colSpan={3}>
          <div className='my-auto line-clamp-1 h-fit w-full items-center font-mono text-[15px] text-secondary'>
            {person.email}
          </div>
        </TableCell>
        <TableCell colSpan={1.5}>
          <div className='my-auto line-clamp-1 h-fit w-full items-center font-mono text-[15px]'>
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses[person.role]}`}
            >
              {person.role}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex w-full justify-end'>
            <MemberOption person={person} role={role}>
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
  filter: 'All' | Role;
  setFilter: Dispatch<SetStateAction<'All' | Role>>;
}) {
  return (
    <Select
      value={props.filter}
      onValueChange={(value: string) => props.setFilter(value as 'All' | Role)}
    >
      <SelectTrigger className='w-[220px] min-w-[220px] bg-accent max-md:w-full'>
        <SelectValue placeholder='Select role' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort by role</SelectLabel>
          <SelectSeparator />
          <SelectItem value='All'>All roles</SelectItem>
          <SelectItem value='Owner'>Owner</SelectItem>
          <SelectItem value='Admin'>Admin</SelectItem>
          <SelectItem value='Developer'>Developer</SelectItem>
          <SelectItem value='Guest'>Guest</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function MemberOption({
  children,
  person,
  role,
}: {
  children: ReactNode;
  person: Person;
  role: Role;
}) {
  const confirm = useConfirm();
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      toast.success(person.email + ' copied to clipboard');
    } catch (err) {
      console.error('Failed to copy email: ', err);
      toast.error('Failed to copy email');
    }
  };

  async function switchRole(props: { role: Role; name: string }) {
    const isConfirmed = await confirm({
      title: `Switch ${props.name} role to ${props.role}`,
      description: `Are you sure you want to change ${props.name}'s role to ${props.role}? This action will affect their permissions and access levels.`,
      confirmText: 'Yes, switch',
      cancelText: 'Cancel',
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className='mr-8 w-56 rounded-[12px] shadow-md'>
        <DropdownMenuLabel>{person.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {person.name === 'You' ? (
            <></>
          ) : (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={
                  role === 'Guest' || role === 'Developer' ? 'hidden' : ''
                }
              >
                Change role
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    disabled={person.role === 'Admin'}
                    onClick={() =>
                      switchRole({ role: 'Admin', name: person.name })
                    }
                  >
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses['Admin']}`}
                    >
                      Admin
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={person.role === 'Developer'}
                    onClick={() =>
                      switchRole({ role: 'Developer', name: person.name })
                    }
                  >
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses['Developer']}`}
                    >
                      Developer
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={person.role === 'Guest'}
                    onClick={() =>
                      switchRole({ role: 'Guest', name: person.name })
                    }
                  >
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses['Guest']}`}
                    >
                      Guest
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          <DropdownMenuItem onClick={handleCopyEmail}>
            Copy email
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {role === 'Guest' ||
        role === 'Developer' ||
        person.name === 'You' ? undefined : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className='hover:!text-destructive'>
                Remove member
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
