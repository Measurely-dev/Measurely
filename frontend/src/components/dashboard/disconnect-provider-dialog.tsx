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
import { ReactNode } from 'react';

export default function DisconnectProviderDialog(props: {
  children: ReactNode;
}) {
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
        <form className='flex flex-col gap-4' onSubmit={(e) => {}}>
          <div className='flex flex-row items-center justify-center gap-4'>
            <div className='flex w-full flex-col gap-3'>
              <Label>New password</Label>
              <Input
                placeholder='New password'
                type='password'
                className='h-11 rounded-[12px]'
              />
              <Label>Confirm new password</Label>
              <Input
                placeholder='Confirm new password'
                type='password'
                className='h-11 rounded-[12px]'
              />
            </div>
          </div>
          <div className='flex w-full flex-row gap-2'>
            <DialogClose className='w-full'>
              <Button
                type='button'
                variant='secondary'
                className='w-full rounded-[12px]'
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type='submit'
              variant='default'
              className='w-full rounded-[12px]'
            >
              Disconnect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
