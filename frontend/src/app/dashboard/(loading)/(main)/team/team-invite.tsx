'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TeamInvite(props: {
  loading: boolean;
  disable?: boolean | false;
}) {
  const [inviteLoading, setInviteLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('observer');
  function sendEmail() {
    setInviteLoading(true);
    setTimeout(() => setInviteLoading(false), 500);
    toast.success('Invite sent');
  }

  return (
    <Card className='h-fit border-none bg-accent p-5'>
      <CardContent className='p-0'>
        <div className='flex flex-row items-center justify-between'>
          <div className='mt-2 text-sm text-muted-foreground'>
            Invite new members by email address
          </div>
        </div>
        <Separator className='my-5' />
        <div className='flex w-full flex-col'>
          <div className='flex w-full flex-row gap-5 max-sm:flex-col'>
            <div className='flex w-full flex-col gap-3'>
              <Label>Email</Label>
              <Input
                placeholder='jane@exemple.com'
                disabled={props.disable}
                type='email'
                className='h-11 w-full rounded-[12px]'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-3'>
              <Label htmlFor='type'>Role</Label>
              <Select defaultValue='observer' disabled={props.disable}>
                <SelectTrigger
                  id='type'
                  className='h-11 w-[300px] max-w-[300px] rounded-[12px] bg-background max-sm:w-full max-sm:max-w-none'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin' onClick={() => setRole('admin')}>
                    Admin
                  </SelectItem>
                  <SelectItem value='developer' onClick={() => setRole('developer')}>
                    Developer
                  </SelectItem>
                  <SelectItem
                    value='observer'
                    onClick={() => setRole('observer')}
                  >
                    Observer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {props.loading ? (
            <>
              <Skeleton className='mt-4 flex h-9 w-fit items-center px-3 !text-transparent'>
                <UserPlus className='mr-2 size-5' />
                Add member
              </Skeleton>
            </>
          ) : (
            <Button
              variant='ghost'
              className='mt-4 w-fit rounded-[12px] !bg-background text-secondary'
              disabled={
                props.disable || email === '' || inviteLoading ? true : false
              }
              onClick={sendEmail}
              loading={inviteLoading}
            >
              {inviteLoading ? (
                'Add member'
              ) : (
                <>
                  <UserPlus className='mr-2 size-4' />
                  Add member
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
