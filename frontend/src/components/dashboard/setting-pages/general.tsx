'use client';

// UI Component imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SettingCard from '../setting-card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FormEvent, useContext, useState } from 'react';
import { UserContext } from '@/dash-context';
import DisconnectProviderDialog from '../disconnect-provider-dialog';
import { Info, UserRoundX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { providers } from '@/providers';
import { useConfirm } from '@omit/react-confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon } from '@radix-ui/react-icons';
import { MAXFILESIZE } from '@/utils';

export default function GeneralSettings() {
  // User context and router setup
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const confirm = useConfirm();

  // Loading state management
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Form field states
  const [firstName, setFirstName] = useState(user?.first_name?.trim());
  const [lastName, setLastName] = useState(user?.last_name?.trim());
  const [email, setEmail] = useState(user?.email?.trim());
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');

  // Profile image states
  const [file, setFile] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);

  // Handler for updating profile information (name and image)
  const handleFirstLastNameSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();

    if (file !== null && file.size > MAXFILESIZE) {
      toast.error('The image is too large, MAX 500KB');
      return;
    }

    if (!trimmedFirstName) {
      toast.error('The first name field must be filled');
      return;
    }

    setLoadingProfile(true);
    const updated = {
      first_name: user.first_name,
      last_name: user.last_name,
      image: user.image,
    };

    // Update name if changed
    if (
      trimmedFirstName.toLowerCase() !== user.first_name ||
      trimmedLastName?.toLowerCase() !== user.last_name
    ) {
      const response1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/name`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: trimmedFirstName.toLowerCase(),
          last_name: trimmedLastName?.toLowerCase(),
        }),
      });

      if (response1.ok) {
        toast.success('Successfully updated first name and/or last name.');
        updated.first_name = trimmedFirstName.toLowerCase();
        updated.last_name = trimmedLastName?.toLowerCase();
      }
    }

    // Upload new profile image if selected
    if (file !== null) {
      const formData = new FormData();
      formData.append('file', file);
      const response2 = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user_image`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        },
      );

      if (response2.ok) {
        toast.success('Successfully updated your image.');
        const body = await response2.json();
        updated['image'] = body.url;
        setFile(null);
        setReader(null);
      }
    }

    setUser(Object.assign({}, user, updated));
    setLoadingProfile(false);
  };

  // Handler for email change request
  const handleEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      toast.error('The email field cannot be empty');
      return;
    }
    setLoadingEmail(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/request_email_change`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_email: trimmedEmail.toLowerCase() }),
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

  // Handler for password update
  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedOldPassword = oldPassword?.trim();
    const trimmedNewPassword = newPassword?.trim();
    const trimmedConfirmedPassword = confirmedPassword?.trim();

    if (
      !trimmedOldPassword ||
      !trimmedNewPassword ||
      !trimmedConfirmedPassword
    ) {
      toast.error('All fields must be filled');
      return;
    }

    if (trimmedConfirmedPassword !== trimmedNewPassword) {
      toast.error('The passwords do not match');
      return;
    }

    setLoadingPassword(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/password`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        old_password: trimmedOldPassword,
        new_password: trimmedNewPassword,
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

  // Handler for account deletion
  const DeleteAccount = async () => {
    const isConfirmed = await confirm({
      title: 'Delete my account',
      icon: <UserRoundX className='size-6 text-destructive' />,
      description:
        'Are you sure you want to delete this account? You will loose all the data linked to this account forever.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      cancelButton: {
        size: 'default',
        variant: 'outline',
        className: 'rounded-[12px]',
      },
      confirmButton: {
        className: 'bg-red-500 hover:bg-red-600 text-white rounded-[12px]',
      },
      alertDialogTitle: {
        className: 'flex items-center gap-2',
      },
      alertDialogContent: {
        className: '!rounded-[12px]',
      },
    });

    if (isConfirmed) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
        method: 'DELETE',
        credentials: 'include',
      }).then((resp) => {
        if (resp.status === 200) {
          toast.success(
            'Successfully deleted your account. You will now be logged out.',
          );
          router.push('/sign-in');
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
      });
    }
  };

  // Component render
  return (
    <div className='grid gap-5'>
      <SettingCard
        title='Profile'
        description='Used to identify your account.'
        btn_loading={loadingProfile}
        btn_disabled={
          !firstName?.trim() ||
          (firstName.trim() === user.first_name &&
            lastName?.trim() === user.last_name &&
            file === null)
        }
        action={handleFirstLastNameSubmit}
        content={
          <div className='flex w-full flex-row gap-2 max-md:flex-col max-md:gap-4'>
            <div className='flex flex-row gap-2'>
              <Avatar className='relative mr-4 size-[65px] cursor-pointer items-center justify-center overflow-visible !rounded-full bg-accent'>
                <Label className='relative h-full w-full cursor-pointer'>
                  <AvatarImage
                    className='rounded-full'
                    alt='Project image'
                    src={reader === null ? user.image : reader}
                  />
                  <AvatarFallback className='h-full w-full !rounded-full'>
                    <ImageIcon className='size-5 text-secondary' />
                  </AvatarFallback>
                  <Input
                    type='file'
                    accept='.jpg, .jpeg, .png, .webp .svg'
                    className='absolute left-0 top-0 h-full w-full cursor-pointer bg-background opacity-0'
                    onChange={(event) => {
                      const selectedFile = event.target.files?.[0];
                      if (!selectedFile) return;
                      const r = new FileReader();
                      r.onload = (e) => {
                        setReader(e.target?.result);
                      };
                      r.readAsDataURL(selectedFile);
                      setFile(event.target.files?.[0]);
                    }}
                  />
                </Label>
              </Avatar>
            </div>
            <Label className='flex w-full flex-col gap-2'>
              First Name
              <Input
                placeholder='John'
                name='first_name'
                className='w-full'
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
                className='w-full'
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
        btn_disabled={!email?.trim() || email.trim() === user.email}
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
          !oldPassword?.trim() ||
          !newPassword?.trim() ||
          !confirmedPassword?.trim()
        }
        disabled={
          user.providers === null ? false : (user.providers.length ?? 0) > 0
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
                    <div className='flex size-10 items-center justify-center rounded-md bg-accent'>
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
                  {(user.providers === null
                    ? 0
                    : (user?.providers.filter((p) => p.type === provider.type)
                        .length ?? 0)) === 0 ? (
                    <Button
                      variant={'ghost'}
                      className='rounded-[10px]'
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
                        user.providers.filter(
                          (p) => p.type === provider.type,
                        )[0] ?? null
                      }
                      providerLength={
                        user.providers === null
                          ? 0
                          : (user.providers.length ?? 0)
                      }
                    >
                      <Button variant={'ghost'} className='rounded-[10px]'>
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
            <Button
              variant={'destructiveOutline'}
              className='rounded-[10px]'
              onClick={DeleteAccount}
            >
              Delete account
            </Button>
          </div>
        }
      />
    </div>
  );
}
