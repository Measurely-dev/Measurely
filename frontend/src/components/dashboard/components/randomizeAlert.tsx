'use client';
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
import { AppsContext } from '@/dashContext';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function RandomizeAlert(props: {
  children: ReactNode;
  appId: string;
}) {
  const { applications, setApplications } = useContext(AppsContext);
  const [apiIndex, setApiIndex] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (applications !== null) {
      setApiIndex(applications.findIndex((app) => app.id === props.appId));
    }
  }, []);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent className='border border-red-500 bg-red-500/30 py-8 backdrop-blur-3xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-red-200'>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-red-300'>
            This action cannot be undone. This will permanently change your
            current API KEY.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='rounded-[8px] bg-white'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className='rounded-[8px] border border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90'
            onClick={() => {
              fetch(process.env.NEXT_PUBLIC_API_URL + '/rand-apikey', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  appid:
                    apiIndex !== undefined ? applications?.[apiIndex].id : '',
                }),
                credentials: 'include',
              })
                .then((res) => {
                  if (res.ok === true) {
                    return res.text();
                  } else {
                    toast.error(
                      'Failed to generate a new API KEY. Try again later.',
                    );
                  }
                })
                .then((data) => {
                  if (
                    data !== null &&
                    data !== undefined &&
                    applications !== null
                  ) {
                    toast.success('API key succesfully randomized');
                    setApplications(
                      applications?.map((v, i) =>
                        i === apiIndex
                          ? Object.assign({}, v, {
                              apikey: data,
                            })
                          : v,
                      ),
                    );
                  }
                });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
