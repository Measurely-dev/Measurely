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
  loading: boolean;
  action: (e: FormEvent<HTMLFormElement>) => void;
  btn?: string | undefined;
  danger?: boolean | false;
}) => {
  return (
    <form className='flex flex-col' onSubmit={props.action}>
      <Card className={props.danger ? 'border-red-500/40' : ''}>
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
              loading={props.loading}
              disabled={props.loading}
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
