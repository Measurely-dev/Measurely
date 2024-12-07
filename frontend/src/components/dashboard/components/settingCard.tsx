import React, { ReactNode } from 'react';
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
  btn?: string | undefined;
  action?: (value: any) => void;
  danger?: boolean | false;
}) => {
  return (
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
          <Button className='w-full rounded-[12px]' onClick={props.action}>
            {props.btn}
          </Button>
        </CardFooter>
      ) : undefined}
    </Card>
  );
};

export default SettingCard;
