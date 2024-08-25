'use client';
import { inviteNewMemberAction } from '@/backend/actions/team/members';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TeamContext } from '@/contexts/teamContext';
import { StatusType, TeamRole } from '@/types';
import { useContext, useState } from 'react';

export default function SendInvite() {
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<TeamRole>(TeamRole.Member);
  const [loading, setLoading] = useState<boolean>(false);
  const { teams } = useContext(TeamContext);

  return (
    <Card className='rounded-[16px] border-none bg-accent p-5'>
      {/* Card content */}
      <CardContent className='p-0'>
        <div className='flex flex-col'>
          <div className='text-base font-medium'>Send invite</div>
          <div className='mt-2 text-sm text-secondary'>
            Collecte valuable insights on user behaviour and site performance
            with detailed page with metrics.{' '}
          </div>
        </div>
        <Separator className='my-[16px]' />
        <div className='flex w-full flex-col'>
          <div className='flex w-full flex-row gap-2'>
            <div className='flex w-full flex-col gap-3'>
              <Label>Email address</Label>
              <Input
                placeholder='jane@exemple.com'
                type='email'
                className='h-11 rounded-[12px]'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className='flex w-full flex-col gap-3'>
              <Label htmlFor='type'>Role</Label>
              <Select
                defaultValue={TeamRole.Member.toString()}
                onValueChange={(e) => setRole(parseInt(e))}
              >
                <SelectTrigger
                  id='type'
                  className='h-11 rounded-[12px] bg-background'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TeamRole.Member.toString()}>
                    Member
                  </SelectItem>
                  <SelectItem value={TeamRole.Admin.toString()}>
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className='mt-5 w-fit rounded-[12px]'
            disabled={email === '' || loading}
            loading={loading}
            onClick={async () => {
              setLoading(true);
              const response = await inviteNewMemberAction(
                teams.list[teams.activeTeam].identifier,
                email,
                role
              );

              if (response.status !== StatusType.Success) {
                alert(response.status);
              }

              setEmail('');

              setLoading(false);
            }}
          >
            Add member
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
