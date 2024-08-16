import { Badge } from '@/components/ui/badge';
import { TeamContext } from '@/contexts/teamContext';
import { PlanType } from '@/types';
import { useContext } from 'react';

export default function TeamType() {
  const { teams } = useContext(TeamContext);
  const render = () => {
    switch (
      teams.list.find(
        (team, i) => team.identifier === teams.list[teams.activeTeam].identifier
      )?.plan_type
    ) {
      case PlanType.Hobby:
        return (
          <Badge className='pointer-events-none rounded-full bg-green-500/10 font-medium text-green-500 shadow-none'>
            <span className='-ml-0.5 mr-2 size-1.5 shrink-0 rounded-full bg-current'></span>
            Hobby plan
          </Badge>
        );
      case PlanType.Plus:
        return (
          <Badge className='pointer-events-none rounded-full bg-blue-500/10 font-medium text-blue-500 shadow-none'>
            <span className='-ml-0.5 mr-2 size-1.5 shrink-0 rounded-full bg-current'></span>
            Plus plan
          </Badge>
        );
      case PlanType.Pro:
        return (
          <Badge className='pointer-events-none rounded-full bg-purple-500/10 font-medium text-purple-500 shadow-none'>
            <span className='-ml-0.5 mr-2 size-1.5 shrink-0 rounded-full bg-current'></span>
            Pro plan
          </Badge>
        );
      case PlanType.Custom:
        return (
          <Badge className='pointer-events-none rounded-full bg-purple-500/10 font-medium text-red-500 shadow-none'>
            <span className='-ml-0.5 mr-2 size-1.5 shrink-0 rounded-full bg-current'></span>
            Entreprise plan
          </Badge>
        );
    }
  };

  return render();
}
