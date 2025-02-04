'use client';

// Import required dependencies for user interface and navigation
import { UserContext } from '@/dash-context';
import { useRouter } from 'next/navigation';
import { ReactNode, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FloatingPanelBody,
  FloatingPanelButton,
  FloatingPanelContent,
  FloatingPanelRoot,
  FloatingPanelTrigger,
} from '@/components/ui/floating-panel';
import { AnimatePresence } from 'framer-motion';
import { LogOut, MessageCircleDashed } from 'lucide-react';

// Helper function to capitalize first letter of a string
function Capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Main avatar dropdown component that wraps the floating panel
export default function AvatarDropdown(props: { children: ReactNode }) {
  return (
    <QuickActionsFloatingPanel>{props.children}</QuickActionsFloatingPanel>
  );
}

// Component that handles the floating panel UI and actions
const QuickActionsFloatingPanel = (props: { children: ReactNode }) => {
  const router = useRouter();
  const { user } = useContext(UserContext);

  // Define available actions in the dropdown menu
  const actions = [
    {
      icon: <MessageCircleDashed className='h-4 w-4' />,
      label: 'Support',
      action: () => router.push('https://measurely.dev/help'),
    },
    {
      icon: <LogOut className='h-4 w-4' />,
      label: 'Logout',
      action: () => {
        fetch(process.env.NEXT_PUBLIC_API_URL + '/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).then(() => {
          router.push('/sign-in');
          window.location.reload();
        });
      },
    },
  ];

  return (
    <FloatingPanelRoot>
      <FloatingPanelTrigger
        className='!rounded-full'
        title={Capitalize(user.first_name) + ' ' + Capitalize(user.last_name)}
        description={user.email}
      >
        {props.children}
      </FloatingPanelTrigger>
      <FloatingPanelContent className='w-56' side='right'>
        <FloatingPanelBody className='p-2'>
          <AnimatePresence>
            {actions.map((action, index) => (
              <motion.div key={index}>
                <FloatingPanelButton
                  onClick={action.action}
                  className={`flex w-full items-center space-x-2 rounded-[10px] px-4 py-2 transition-colors ${action.label === 'Logout' ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-muted'}`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </FloatingPanelButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
};
