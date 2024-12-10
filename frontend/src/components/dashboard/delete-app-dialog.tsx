import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ReactNode } from 'react';

export default function DeleteAppDialog(props: { children: ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent className='border border-red-500 bg-red-500/30 py-8 backdrop-blur-3xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-red-200'>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-red-300'>
            This action cannot be undone. This will permanently this
            application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='rounded-[8px] bg-white'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className='rounded-[8px] border border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90'>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
