'use client';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Home, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import SettingGeneralPage from './settingPages/general';
import { Hexagon } from 'react-feather';
import SettingAppsPage from './settingPages/apps-api';
import SettingPaymentPage from './settingPages/plan';
import { Button } from '@/components/ui/button';

export default function SettingDialog(props: { children: ReactNode }) {
  const [page, setPage] = useState('general');
  const settings = [
    {
      name: 'General',
      icon: <Home className='size-4 text-blue-500' />,
      value: 'general',
    },
    {
      name: 'Applications',
      icon: <Hexagon className='size-4 text-blue-500' />,
      value: 'applications',
    },
    {
      name: 'Payment',
      icon: <CreditCard className='size-4 text-blue-500' />,
      value: 'payment',
    },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='flex h-[70%] max-h-[70%] min-w-[80%] flex-row gap-0 overflow-hidden !rounded-xl bg-transparent !p-0 !shadow-none ring-1 ring-input max-lg:min-w-[95%] max-md:min-h-[95%] max-md:max-w-[95%] max-md:flex-col lg:min-w-[900px] lg:max-w-[900px]'>
        <Navbar page={page} setPage={setPage} settings={settings} />
        <DialogClose className='absolute right-8 top-11 max-md:right-4 max-md:top-4'>
          <Button
            type='button'
            size={'icon'}
            variant='secondary'
            className='rounded-[12px] border md:hidden max-md:bg-background'
          >
            <X />
          </Button>
        </DialogClose>
        <Content page={page} setPage={setPage} settings={settings} />
      </DialogContent>
    </Dialog>
  );
}

function Navbar(props: {
  page: any;
  setPage: (value: any) => void;
  settings: Array<any>;
}) {
  return (
    <div className='max-md:min-w-none h-full min-w-[230px] border-r border-input bg-accent px-2 pt-8 max-md:h-fit max-md:border-b max-md:pb-4'>
      <div className='ml-4 text-xs font-medium text-secondary'>Settings</div>
      <div className='mt-3 flex flex-col gap-2'>
        {props.settings.map((item, i) => {
          return (
            <div
              key={i}
              className={`flex w-full cursor-pointer select-none flex-row items-center gap-2 rounded-[8px] px-4 py-[5px] text-sm font-medium text-primary hover:bg-zinc-400/15 ${
                props.page === item.value ? 'bg-zinc-400/15' : ''
              }`}
              onClick={() => props.setPage(item.value)}
            >
              {item.icon}
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Content(props: {
  page: any;
  setPage: (value: any) => void;
  settings: Array<any>;
}) {
  function content() {
    switch (props.page) {
      case 'general':
        return <SettingGeneralPage />;
      case 'applications':
        return <SettingAppsPage />;
      case 'payment':
        return <SettingPaymentPage />;
    }
  }
  return (
    <div className='flex h-full w-full flex-col gap-5 overflow-y-scroll bg-white p-8 pl-10 pt-11 max-md:px-4'>
      <div className='mb-3 text-2xl font-semibold'>
        {props.settings.map((setting) => {
          return setting.value === props.page ? setting.name : undefined;
        })}
      </div>
      {content()}
    </div>
  );
}
