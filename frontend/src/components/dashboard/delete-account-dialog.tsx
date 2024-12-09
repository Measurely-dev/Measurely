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
import { UserContext } from '@/dash-context';
import { Provider } from '@/types';
import { useRouter } from 'next/navigation';
import { ReactNode, useContext } from 'react';
import { toast } from 'sonner';

export default function DeleteAccountAlert(props: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useContext(UserContext);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent className='border border-red-500 bg-red-500/30 py-8 backdrop-blur-3xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-red-200'>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-red-300'>
            This action cannot be undone. This will permanently delete your
            account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='rounded-[8px] bg-white'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className='rounded-[8px] border border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90'
            onClick={() => {
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
                method: 'DELETE',
                credentials: 'include',
              }).then((resp) => {
                if (resp.status === 200) {
                  toast.success(
                    'Successfully deleted your account. You will now be logged out.',
                  );

                  setTimeout(() => {
                    if (user?.provider === Provider.GITHUB) {
                      router.push(
                        `${process.env.NEXT_PUBLIC_API_URL}/use-github?type=1`,
                      );
                    } else {
                      router.push('/sign-in');
                    }
                  }, 500);
                } else {
                  resp.text().then((text) => {
                    toast.error(text);
                  });
                }
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
