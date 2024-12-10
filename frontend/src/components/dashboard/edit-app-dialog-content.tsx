'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Application } from '@/types';
import { Image } from 'lucide-react';

export default function EditAppDialogContent(props : {app : Application | null}) {
  return (
    <DialogContent className='rounded-sm shadow-sm'>
      <DialogHeader className='static'>
        <DialogTitle>Edit application</DialogTitle>
      </DialogHeader>
      <form className='flex flex-col gap-4'>
        <div className='flex flex-row items-center justify-center gap-4'>
          <Avatar className='relative size-[70px] cursor-pointer items-center justify-center overflow-visible !rounded-[16px]'>
            <Label className='relative h-full w-full cursor-pointer'>
              <AvatarImage className='rounded-[16px]' />
              <AvatarFallback className='h-full w-full !rounded-[16px]'>
                <Image className='text-secondary' />
              </AvatarFallback>
              <Input
                type='file'
                accept='.jpg, .jpeg, .png, .webp .svg'
                className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
              />
            </Label>
          </Avatar>
          <div className='flex w-full flex-col gap-3'>
            <Label>Application name</Label>
            <Input
              placeholder='My-app'
              type='text'
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
            Update
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
