'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, MotionConfig, Variants, motion } from 'framer-motion';
import { ArrowLeftIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const TRANSITION = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.4,
};

interface FloatingPanelContextType {
  isOpen: boolean;
  openFloatingPanel: (rect: DOMRect) => void;
  closeFloatingPanel: () => void;
  uniqueId: string;
  note: string;
  setNote: (note: string) => void;
  triggerRect: DOMRect | null;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (title: string) => void;
}

const FloatingPanelContext = createContext<
  FloatingPanelContextType | undefined
>(undefined);

function useFloatingPanel() {
  const context = useContext(FloatingPanelContext);
  if (!context) {
    throw new Error(
      'useFloatingPanel must be used within a FloatingPanelProvider',
    );
  }
  return context;
}

function useFloatingPanelLogic() {
  const uniqueId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const openFloatingPanel = (rect: DOMRect) => {
    setTriggerRect(rect);
    setIsOpen(true);
  };
  const closeFloatingPanel = () => {
    setIsOpen(false);
    setNote('');
  };

  return {
    isOpen,
    openFloatingPanel,
    closeFloatingPanel,
    uniqueId,
    note,
    setNote,
    triggerRect,
    title,
    setTitle,
    setDescription,
    description,
  };
}

interface FloatingPanelRootProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingPanelRoot({
  children,
  className,
}: FloatingPanelRootProps) {
  const floatingPanelLogic = useFloatingPanelLogic();

  return (
    <FloatingPanelContext.Provider value={floatingPanelLogic}>
      <MotionConfig transition={TRANSITION}>
        <div className={cn('relative', className)}>{children}</div>
      </MotionConfig>
    </FloatingPanelContext.Provider>
  );
}

interface FloatingPanelTriggerProps {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
}
export function FloatingPanelTrigger({
  children,
  className,
  title,
  description,
}: FloatingPanelTriggerProps) {
  const { openFloatingPanel, uniqueId, setTitle, setDescription, isOpen } =
    useFloatingPanel();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (triggerRef.current) {
      openFloatingPanel(triggerRef.current.getBoundingClientRect());
      setTitle(title);
      setDescription(description ?? '');
    }
  };

  return (
    <motion.button
      ref={triggerRef}
      layoutId={`floating-panel-trigger-${uniqueId}`}
      className={cn('relative overflow-hidden', className)}
      style={{ borderRadius: 8 }} // Set the border-radius here
      onClick={handleClick}
      aria-haspopup='dialog'
      aria-expanded={false}
    >
      {/* Dashed border when panel is open */}
      <motion.div
        className='absolute left-0 top-0 z-10 size-full'
        style={{ borderRadius: 'inherit' }} // Inherit border-radius from the parent
        initial={{ border: '1.5px solid transparent' }}
        animate={{
          border: isOpen ? '1.5px dashed #e4e4e7' : '1px solid transparent',
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      />

      {/* Animated content */}
      <motion.div
        layoutId={`floating-panel-label-container-${uniqueId}`}
        className='flex items-center'
        initial={{ opacity: 1 }}
        animate={{ opacity: isOpen ? 0 : 1 }} // Fade out when panel is open
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <motion.span
          layoutId={`floating-panel-label-${uniqueId}`}
          className='text-sm font-semibold'
        >
          {children}
        </motion.span>
      </motion.div>
    </motion.button>
  );
}
interface FloatingPanelContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right'; // Only left and right are supported
}

export function FloatingPanelContent({
  children,
  className,
  side = 'left', // Default to 'left'
}: FloatingPanelContentProps) {
  const {
    isOpen,
    closeFloatingPanel,
    uniqueId,
    triggerRect,
    title,
    description,
  } = useFloatingPanel();
  const contentRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(0); // Track panel width

  // Update panel width after the panel mounts
  useEffect(() => {
    if (contentRef.current) {
      setPanelWidth(contentRef.current.offsetWidth);
    }
  }, [isOpen]); // Recalculate when the panel opens

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        closeFloatingPanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeFloatingPanel]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFloatingPanel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeFloatingPanel]);

  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  // Calculate position based on the `side` prop
  const getPositionStyle = () => {
    if (!triggerRect) return { left: '50%', top: '50%' };

    switch (side) {
      case 'left':
        return {
          left: triggerRect.left, // Align left side of panel with left side of button
          top: triggerRect.bottom + 8, // Position below the button
        };
      case 'right':
        return {
          left: triggerRect.right - panelWidth, // Align right side of panel with right side of button
          top: triggerRect.bottom + 8, // Position below the button
        };
      default:
        return { left: '50%', top: '50%' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ backgroundColor: 'transparent', opacity: 0 }}
            animate={{ backgroundColor: 'black', opacity: 0.2 }}
            exit={{ backgroundColor: 'transparent', opacity: 0 }}
            className='fixed inset-0 z-40'
          />
          <motion.div
            ref={contentRef}
            layoutId={`floating-panel-${uniqueId}`}
            className={cn(
              'fixed z-50 overflow-hidden border border-zinc-950/10 bg-white shadow-lg outline-none dark:border-zinc-50/10 dark:bg-zinc-800',
              className,
            )}
            style={{
              borderRadius: 12,
              ...getPositionStyle(), // Apply dynamic positioning
              transformOrigin: 'top left',
            }}
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={variants}
            role='dialog'
            aria-modal='true'
            aria-labelledby={`floating-panel-title-${uniqueId}`}
          >
            <FloatingPanelTitle title={title} description={description} />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FloatingPanelTitle(props: { title: string; description: string }) {
  const { uniqueId } = useFloatingPanel();

  return (
    <motion.div
      layoutId={`floating-panel-label-container-${uniqueId}`}
      className='flex flex-col bg-white px-4 py-2 dark:bg-zinc-800'
    >
      <motion.div
        layoutId={`floating-panel-label-${uniqueId}`}
        className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'
        id={`floating-panel-title-${uniqueId}`}
      >
        {props.title}
      </motion.div>
      {props.description && (
        <motion.div
          layoutId={`floating-panel-description-${uniqueId}`}
          className='text-sm text-zinc-600 dark:text-zinc-400'
        >
          {props.description}
        </motion.div>
      )}
    </motion.div>
  );
}

interface FloatingPanelFormProps {
  children: React.ReactNode;
  onSubmit?: (note: string) => void;
  className?: string;
}

export function FloatingPanelForm({
  children,
  onSubmit,
  className,
}: FloatingPanelFormProps) {
  const { note, closeFloatingPanel } = useFloatingPanel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(note);
    closeFloatingPanel();
  };

  return (
    <form
      className={cn('flex h-full flex-col', className)}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}

interface FloatingPanelLabelProps {
  children: React.ReactNode;
  htmlFor: string;
  className?: string;
}

export function FloatingPanelLabel({
  children,
  htmlFor,
  className,
}: FloatingPanelLabelProps) {
  return (
    <motion.label
      htmlFor={htmlFor}
      className={cn(
        'mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100',
        className,
      )}
    >
      {children}
    </motion.label>
  );
}

interface FloatingPanelTextareaProps {
  className?: string;
  id?: string;
  min?: number;
  max?: number;
}

export function FloatingPanelTextarea({
  className,
  id,
  min,
  max,
}: FloatingPanelTextareaProps) {
  const { note, setNote } = useFloatingPanel();

  return (
    <textarea
      id={id}
      minLength={min}
      maxLength={max}
      className={cn(
        'h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm outline-none',
        className,
      )}
      autoFocus
      value={note}
      onChange={(e) => setNote(e.target.value)}
    />
  );
}

interface FloatingPanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingPanelHeader({
  children,
  className,
}: FloatingPanelHeaderProps) {
  return (
    <motion.div
      className={cn(
        'px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-100',
        className,
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingPanelBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingPanelBody({
  children,
  className,
}: FloatingPanelBodyProps) {
  return (
    <motion.div
      className={cn('p-4', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingPanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingPanelFooter({
  children,
  className,
}: FloatingPanelFooterProps) {
  return (
    <motion.div
      className={cn('flex justify-between px-4 py-3', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingPanelCloseButtonProps {
  className?: string;
  icon?: React.ReactNode; // Optional custom icon
  ariaLabel?: string; // Optional custom aria-label
}

export function FloatingPanelCloseButton({
  className,
  icon = (
    <ArrowLeftIcon size={16} className='text-zinc-900 dark:text-zinc-100' />
  ), // Default icon
  ariaLabel = 'Close floating panel', // Default aria-label
}: FloatingPanelCloseButtonProps) {
  const { closeFloatingPanel } = useFloatingPanel();

  return (
    <motion.button
      type='button'
      className={cn('flex items-center', className)}
      onClick={closeFloatingPanel}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.button>
  );
}

interface FloatingPanelSubmitButtonProps {
  className?: string;
  children?: React.ReactNode; // Optional custom children
}

export function FloatingPanelSubmitButton({
  className,
  children = 'Submit', // Default text
}: FloatingPanelSubmitButtonProps) {
  return (
    <motion.button
      className={cn(
        'relative ml-1 flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800',
        className,
      )}
      type='submit'
      aria-label='Submit'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

interface FloatingPanelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function FloatingPanelButton({
  children,
  onClick,
  className,
}: FloatingPanelButtonProps) {
  return (
    <motion.button
      className={cn(
        'flex w-full items-center gap-2 rounded-md py-2 text-left text-sm',
        className,
      )}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

export {
  FloatingPanelRoot as Root,
  FloatingPanelTrigger as Trigger,
  FloatingPanelContent as Content,
  FloatingPanelForm as Form,
  FloatingPanelLabel as Label,
  FloatingPanelTextarea as Textarea,
  FloatingPanelHeader as Header,
  FloatingPanelBody as Body,
  FloatingPanelFooter as Footer,
  FloatingPanelCloseButton as CloseButton,
  FloatingPanelSubmitButton as SubmitButton,
  FloatingPanelButton as Button,
};
