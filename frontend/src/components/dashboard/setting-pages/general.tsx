'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SettingCard from '../setting-card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FormEvent, useContext, useState } from 'react';
import { UserContext } from '@/dash-context';
import DeleteAccountAlert from '../delete-account-dialog';
import { Provider } from '@/types';

export default function SettingGeneralPage() {
  const { user, setUser } = useContext(UserContext);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstname);
  const [lastName, setLastName] = useState(user?.lastname);

  const [email, setEmail] = useState(user?.email);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');

  const handleFirstLastNameSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (firstName === '' || lastName === '') {
      toast.error('All fields must be filled');
      return;
    }
    setLoadingProfile(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/name`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ first_name: firstName, last_name: lastName }),
    })
      .then((resp) => {
        if (resp.status === 200) {
          toast.success('Successfully updated first name and/or last name.');
          setUser(
            Object.assign({}, user, {
              firstname: firstName,
              lastname: lastName,
            }),
          );
        } else {
          resp.text().then((text) => toast.error(text));
        }
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  };

  const handleEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email === '') {
      toast.error('The email field cannot be empty');
      return;
    }
    setLoadingEmail(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/email`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((resp) => {
        if (resp.status === 200) {
          toast.success('We sent you an email to confirm your request');
        } else {
          resp.text().then((text) => toast.error(text));
        }
      })
      .finally(() => {
        setLoadingEmail(false);
      });
  };

  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (oldPassword === '' || newPassword === '' || confirmedPassword === '') {
      toast.error('All fileds must be filled');
      return;
    }

    if (confirmedPassword !== newPassword) {
      toast.error('The passwords do not match');
      return;
    }

    setLoadingPassword(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/password`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    })
      .then((resp) => {
        if (resp.status === 200) {
          toast.success('Your password was successfully updated');
        } else {
          resp.text().then((text) => toast.error(text));
        }
      })
      .finally(() => {
        setLoadingPassword(false);
      });
  };

  return (
    <div className='grid gap-6'>
      <SettingCard
        title='Profile'
        description='Used to identify your account.'
        btn_loading={loadingProfile}
        btn_disabled={
          firstName === '' ||
          lastName === '' ||
          (firstName === user?.firstname && lastName === user?.lastname)
        }
        action={handleFirstLastNameSubmit}
        content={
          <div className='flex w-full flex-row gap-2 max-md:flex-col max-md:gap-4'>
            <Label className='flex w-full flex-col gap-2'>
              First Name
              <Input
                placeholder='John'
                name='first_name'
                type='text'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Label>

            <Label className='flex w-full flex-col gap-2'>
              Last name
              <Input
                placeholder='Doe'
                name='last_name'
                type='text'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Label>
          </div>
        }
        btn='Save'
      />

      <SettingCard
        title='Email'
        btn_loading={loadingEmail}
        btn_disabled={email === '' || email === user?.email}
        description='This accounts main email.'
        action={handleEmailSubmit}
        content={
          <Label className='flex flex-col gap-2'>
            <Input
              placeholder='Email'
              type='email'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Label>
        }
        btn='Save'
      />

      <SettingCard
        title='Password'
        btn_loading={loadingPassword}
        btn_disabled={
          oldPassword === '' || newPassword === '' || confirmedPassword === ''
        }
        disabled={user?.provider === Provider.GITHUB}
        description='The key protecting this account.'
        action={handlePasswordSubmit}
        content={
          <div className='flex flex-col gap-4'>
            <Label className='flex flex-col gap-2'>
              Current password
              <Input
                placeholder='Current password'
                name='old_password'
                type='password'
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Label>
            <Label className='flex flex-col gap-2'>
              New password
              <Input
                placeholder='New password'
                name='new_password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Label>
            <Label className='flex flex-col gap-2'>
              Confirm new password
              <Input
                placeholder='Confirm new password'
                name='confirmed_password'
                type='password'
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
              />
            </Label>
          </div>
        }
        btn='Save'
      />

      {/* <SettingCard
        title='Notification'
        description='Choose what you want to be notified about'
        loading={false}
        action={() => { }}
        content={
          <div className='flex flex-col gap-2'>
            <div className='-mx-2 flex select-none items-start space-x-4 rounded-[12px] p-4 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50'>
              <BellIcon className='mt-px h-5 w-5' />
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none'>Everything</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Email digest, mentions & all activity.
                </p>
              </div>
            </div>
            <div className='-mx-2 flex select-none items-start space-x-4 rounded-[12px] bg-gray-100 p-2 p-4 text-gray-900 transition-all dark:bg-gray-800 dark:text-gray-50'>
              <AtSignIcon className='mt-px h-5 w-5' />
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none'>Available</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Only mentions and comments.
                </p>
              </div>
            </div>
            <div className='-mx-2 flex select-none items-start space-x-4 rounded-[12px] p-2 p-4 transition-all hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50'>
              <EyeOffIcon className='mt-px h-5 w-5' />
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none'>Ignoring</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Turn off all notifications.
                </p>
              </div>
            </div>
          </div>
        }
      /> */}

      <SettingCard
        title='Providers'
        description='A list of providers linked to this account.'
        btn_loading={false}
        btn_disabled={false}
        action={() => { }}
        content={
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-row items-center gap-2'>
                <div className='flex size-10 items-center justify-center rounded-[6px] bg-accent'>
                  <svg
                    className='size-6'
                    fill='none'
                    aria-hidden='true'
                    focusable='false'
                    viewBox='0 0 32 32'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    {' '}
                    <path
                      fill='#000'
                      d='M16 2C8.27 2 2 8.268 2 16c0 6.186 4.011 11.433 9.575 13.285.699.13.925-.305.925-.673v-2.607c-3.894.847-4.705-1.652-4.705-1.652-.637-1.618-1.555-2.048-1.555-2.048-1.27-.87.096-.85.096-.85 1.406.097 2.146 1.442 2.146 1.442 1.248 2.14 3.275 1.522 4.074 1.164.125-.905.488-1.523.889-1.872-3.11-.356-6.378-1.556-6.378-6.92 0-1.529.547-2.777 1.442-3.757-.145-.354-.624-1.778.136-3.706 0 0 1.176-.375 3.851 1.436A13.427 13.427 0 0 1 16 8.77c1.19.006 2.388.161 3.507.472 2.673-1.811 3.846-1.436 3.846-1.436.762 1.929.283 3.353.138 3.706.899.98 1.441 2.23 1.441 3.758 0 5.377-3.275 6.561-6.392 6.907.502.434.96 1.286.96 2.593v3.842c0 .372.224.81.934.672C25.994 27.43 30 22.184 30 16c0-7.732-6.268-14-14-14Z'
                    ></path>
                  </svg>
                </div>
                <div className='flex flex-col'>
                  <p className='text-sm font-medium leading-none'>Github</p>
                  <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                    GitHub: platform for code hosting.
                  </p>
                </div>
              </div>
              <Button variant={'ghost'} size={'sm'} className='rounded-[12px]'>
                {user?.provider === Provider.GITHUB ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>
        }
      />

      <SettingCard
        title='Delete account'
        btn_loading={false}
        btn_disabled={false}
        action={() => { }}
        danger
        description='This action will delete this account forever.'
        content={
          <div className='flex flex-col gap-4'>
            <DeleteAccountAlert>
              <Button
                variant={'destructiveOutline'}
                size={'sm'}
                className='rounded-[12px]'
              >
                Delete account
              </Button>
            </DeleteAccountAlert>
          </div>
        }
      />
    </div>
  );
}
