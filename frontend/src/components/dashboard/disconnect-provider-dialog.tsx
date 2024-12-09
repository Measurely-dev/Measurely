'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

export default function DisconnectProviderDialog(props: {
  children: ReactNode;
}) {
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='rounded-sm shadow-sm'>
        <DialogHeader className='static'>
          <DialogTitle>Disconnect provider</DialogTitle>
          <DialogDescription>
            You must choose a new password to disconnect your provider.
          </DialogDescription>
        </DialogHeader>
        <form
          className='flex flex-col gap-4'
          onSubmit={(e) => {
            e.preventDefault();

            if (password === '' || confirmedPassword === '') {
              toast.error('All fields must be filled');
              return;
            }

            if (password !== confirmedPassword) {
              toast.error('The passwords must match');
              return;
            }

            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/disconnect-github`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password }),
            })
              .then((resp) => {
                if (resp.status === 200) {
                  toast.success(
                    'Successfully diconnected the provider. You will now be logged out.',
                  );
                  setTimeout(
                    () =>
                      router.push(
                        `${process.env.NEXT_PUBLIC_API_URL}/use-github?type=1`,
                      ),
                    500,
                  );
                } else {
                  resp.text().then((text) => {
                    toast.error(text);
                  });
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          <div className='flex flex-row items-center justify-center gap-4'>
            <div className='flex w-full flex-col gap-3'>
              <Label>New password</Label>
              <Input
                placeholder='New password'
                type='password'
                className='h-11 rounded-[12px]'
                value={password}
                onChange={(e) => setPassword(e.target.value.trim())}
              />
              <Label>Confirm new password</Label>
              <Input
                placeholder='Confirm new password'
                type='password'
                className='h-11 rounded-[12px]'
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value.trim())}
              />
            </div>
          </div>
          <div className='flex w-full flex-row gap-2'>
            <DialogClose className='w-full'>
              <Button
                type='button'
                variant='secondary'
                className='w-full rounded-[12px]'
                onClick={() => {
                  setPassword('');
                  setConfirmedPassword('');
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type='submit'
              variant='default'
              className='w-full rounded-[12px]'
              loading={loading}
              disabled={loading || password === '' || confirmedPassword === ''}
            >
              Disconnect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
