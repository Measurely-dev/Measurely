import { Badge } from '@/components/ui/badge';

export default function ApplicationType(props: { type: any }) {
  const render = () => {
    switch (props.type) {
      case 'Hobby':
        return (
          <Badge className='pointer-events-none rounded-full bg-green-500/10 font-medium text-green-500 shadow-none'>
            <span className='-ml-0.5 mr-2 size-1.5 shrink-0 rounded-full bg-current'></span>
            Hobby plan
          </Badge>
        );
      case 'Plus':
        return (
          <Badge className='pointer-events-none rounded-full bg-blue-500/10 font-medium text-blue-500 shadow-none'>
            <span className='-ml-0.5 mr-2 size-1.5 shrink-0 rounded-full bg-current'></span>
            Plus plan
          </Badge>
        );
      case 'Pro':
        return (
          <Badge className='pointer-events-none rounded-full bg-purple-500/10 font-medium text-purple-500 shadow-none'>
            <span className='-ml-0.5 mr-2 size-1.5 shrink-0 rounded-full bg-current'></span>
            Pro plan
          </Badge>
        );
      case 'Custom':
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
