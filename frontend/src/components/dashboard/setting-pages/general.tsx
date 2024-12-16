'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SettingCard from '../setting-card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FormEvent, useContext, useState } from 'react';
import { UserContext } from '@/dash-context';
import DeleteAccountAlert from '../delete-account-dialog';
import DisconnectProviderDialog from '../disconnect-provider-dialog';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { providers } from '@/providers';

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

  const router = useRouter();

  const handleFirstLastNameSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (firstName === '') {
      toast.error('The firstname field must be filled');
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/requestemailchange`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_email: email }),
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
                onChange={(e) => setFirstName(e.target.value.trim())}
              />
            </Label>

            <Label className='flex w-full flex-col gap-2'>
              Last name
              <Input
                placeholder='Doe'
                name='last_name'
                type='text'
                value={lastName}
                onChange={(e) => setLastName(e.target.value.trim())}
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
        disabled_text={
          <div className='flex flex-col items-center justify-center gap-4'>
            <Info className='size-16 text-blue-500' />
            <div className='text-md max-w-[220px] text-center text-secondary'>
              You cannot update your{' '}
              <span className='font-semibold text-primary'>email</span> when
              connected to a provider
            </div>
          </div>
        }
        description='This accounts main email.'
        action={handleEmailSubmit}
        content={
          <Label className='flex flex-col gap-2'>
            <Input
              placeholder='Email'
              type='email'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
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
        disabled={
          user?.providers === null ? false : (user?.providers.length ?? 0) > 0
        }
        disabled_text={
          <div className='flex flex-col items-center justify-center gap-4'>
            <Info className='size-16 text-blue-500' />
            <div className='text-md max-w-[220px] text-center text-secondary'>
              You cannot update your{' '}
              <span className='font-semibold text-primary'>password</span> when
              connected to a provider
            </div>
          </div>
        }
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
                onChange={(e) => setOldPassword(e.target.value.trim())}
              />
            </Label>
            <Label className='flex flex-col gap-2'>
              New password
              <Input
                placeholder='New password'
                name='new_password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value.trim())}
              />
            </Label>
            <Label className='flex flex-col gap-2'>
              Confirm new password
              <Input
                placeholder='Confirm new password'
                name='confirmed_password'
                type='password'
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value.trim())}
              />
            </Label>
          </div>
        }
        btn='Save'
      />

      <SettingCard
        title='Providers'
        description='A list of providers linked or not to this account.'
        btn_loading={false}
        btn_disabled={false}
        action={() => {}}
        content={
          <div className='flex flex-col gap-4'>
            {providers.map((provider: any) => {
              return (
                <div
                  key={provider.type}
                  className='flex items-center justify-between'
                >
                  <div className='flex flex-row items-center gap-2'>
                    <div className='flex size-10 items-center justify-center rounded-[6px] bg-accent'>
                      {provider.logo}{' '}
                    </div>
                    <div className='flex flex-col'>
                      <p className='text-sm font-medium leading-none'>
                        {provider.name}
                      </p>
                      <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  {(user?.providers === null
                    ? 0
                    : (user?.providers.filter((p) => p.type === provider.type)
                        .length ?? 0)) === 0 ? (
                    <Button
                      variant={'ghost'}
                      size={'sm'}
                      className='rounded-[12px]'
                      onClick={() => {
                        router.push(
                          `${process.env.NEXT_PUBLIC_API_URL}/oauth/${provider.name.toLowerCase()}?state=connect.${user?.id}`,
                        );
                      }}
                    >
                      Connect
                    </Button>
                  ) : (
                    <DisconnectProviderDialog
                      userprovider={
                        user?.providers.filter(
                          (p) => p.type === provider.type,
                        )[0] ?? null
                      }
                      providerLength={
                        user?.providers === null
                          ? 0
                          : (user?.providers.length ?? 0)
                      }
                    >
                      <Button
                        variant={'ghost'}
                        size={'sm'}
                        className='rounded-[12px]'
                      >
                        Disconnect
                      </Button>
                    </DisconnectProviderDialog>
                  )}
                </div>
              );
            })}
          </div>
        }
      />

      <SettingCard
        title='Delete account'
        btn_loading={false}
        btn_disabled={false}
        action={(e) => {
          e.preventDefault();
        }}
        danger
        description='This action will delete this account and all the data in it forever.'
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
