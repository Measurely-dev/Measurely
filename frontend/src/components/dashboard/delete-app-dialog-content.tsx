import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppsContext } from '@/dash-context';
import { Application } from '@/types';
import { loadMetricsGroups } from '@/utils';
import { act, useContext } from 'react';
import { toast } from 'sonner';

export default function DeleteAppDialogContent(props: {
  app: Application | null;
}) {
  const { applications, setApplications, activeApp, setActiveApp } =
    useContext(AppsContext);
  return (
    <AlertDialogContent className='border border-red-500 bg-red-500/30 py-8 backdrop-blur-3xl'>
      <AlertDialogHeader>
        <AlertDialogTitle className='text-red-200'>
          Are you absolutely sure?
        </AlertDialogTitle>
        <AlertDialogDescription className='text-red-300'>
          This action cannot be undone. This will permanently this application.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className='rounded-[8px] bg-white'>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          className='rounded-[8px] border border-red-500 bg-red-500 text-red-100 hover:bg-red-500/90'
          onClick={() => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/application`, {
              method: 'DELETE',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ appid: props.app?.id }),
            }).then(async (resp) => {
              if (resp.status === 200) {
                toast.success(
                  'Successfully deleted application: ' + props.app?.name,
                );

                if (applications?.length === 1 || applications === undefined) {
                  window.location.reload();
                  return;
                }

                let newActiveApp = 0;
                if (applications?.[activeApp].id === props.app?.id) {
                  newActiveApp = 0;
                } else {
                  const toRemove = applications?.findIndex(
                    (app) => app.id === props.app?.id,
                  );
                  if (toRemove === -1 || toRemove === undefined) return;
                  if (toRemove < activeApp) {
                    newActiveApp = activeApp - 1;
                  }
                }

                if (applications !== null) {
                  if (applications[newActiveApp].groups === null) {
                    const groups = await loadMetricsGroups(
                      applications[newActiveApp].id,
                    );
                    setApplications(
                      applications.map((app, id) =>
                        id === newActiveApp
                          ? Object.assign({}, app, { groups: groups })
                          : app,
                      ),
                    );
                  }
                }

                setActiveApp(newActiveApp);
                localStorage.setItem('activeApp', newActiveApp.toString());

                setApplications(
                  applications?.filter((app) => app.id !== props.app?.id) ?? [],
                );
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
  );
}
