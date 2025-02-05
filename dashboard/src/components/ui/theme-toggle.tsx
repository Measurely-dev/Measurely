'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={cn('h-8 w-16', className)} />; // Prevent hydration issues

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300',
        isDark
          ? 'border border-input bg-card'
          : 'border border-input bg-background',
        className,
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      role='button'
      tabIndex={0}
    >
      <div className='flex w-full items-center justify-between'>
        <div
          suppressHydrationWarning
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            isDark
              ? 'translate-x-0 transform bg-zinc-800'
              : 'translate-x-8 transform bg-gray-200',
          )}
        >
          {isDark ? (
            <Moon className='h-4 w-4 text-white' strokeWidth={1.5} />
          ) : (
            <Sun className='h-4 w-4 text-gray-700' strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}
