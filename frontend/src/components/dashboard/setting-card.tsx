import React, { FormEvent, ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SettingCard = (props: {
  title: string;
  description: string;
  content: ReactNode;
  btn_loading: boolean;
  btn_disabled: boolean;
  disabled?: boolean | false;
  disabled_text?: ReactNode;
  action?: (_: FormEvent<HTMLFormElement>) => void;
  btn?: string | undefined;
  danger?: boolean | false;
}) => {
  return (
    <form className='flex flex-col' onSubmit={props.action}>
      <Card className={`${props.danger ? 'border-red-500/40' : ''} relative`}>
        {props.disabled ? (
          <div className='absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-4 rounded-[16px] bg-accent/20 backdrop-blur-lg'>
            {props.disabled_text}
          </div>
        ) : (
          <></>
        )}
        <div
          className={`p-6 ${props.danger ? 'text-red-500' : ''} ${props.btn !== undefined ? '' : 'pb-6'} ${props.danger ? 'rounded-[15px] border-red-500 bg-red-500/10' : ''}`}
        >
          <CardHeader className='mb-4 p-0'>
            <CardTitle>{props.title}</CardTitle>
            <CardDescription className={props.danger ? 'text-red-500' : ''}>
              {props.description}
            </CardDescription>
          </CardHeader>

          <CardContent className='p-0'>{props.content}</CardContent>
        </div>
        {props.btn !== undefined ? (
          <CardFooter className='border-t p-4 px-6'>
            <Button
              className='w-full rounded-[12px]'
              type='submit'
              loading={props.btn_loading}
              disabled={props.btn_loading || props.btn_disabled}
            >
              {props.btn}
            </Button>
          </CardFooter>
        ) : undefined}
      </Card>
    </form>
  );
};

export default SettingCard;
