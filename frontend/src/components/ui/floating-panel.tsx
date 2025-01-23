'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, MotionConfig, Variants, motion } from 'framer-motion';
import { ArrowLeftIcon, ChevronRight, X } from 'lucide-react';

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

export function useFloatingPanel() {
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
  title: string; // Required prop
  description?: string;
  onClick?: (e: React.MouseEvent) => void;
}
export function FloatingPanelTrigger({
  children,
  className,
  title,
  description,
  onClick, // Destructure onClick prop
}: FloatingPanelTriggerProps) {
  const { openFloatingPanel, uniqueId, setTitle, setDescription, isOpen } =
    useFloatingPanel();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (triggerRef.current) {
      openFloatingPanel(triggerRef.current.getBoundingClientRect());
      setTitle(title);
      setDescription(description ?? '');
    }
    onClick?.(e); // Pass the event to the onClick handler
  };

  return (
    <motion.button
      ref={triggerRef}
      layoutId={`floating-panel-trigger-${uniqueId}`}
      className={cn('relative overflow-hidden', className)}
      style={{ borderRadius: 8 }}
      onClick={(e) => {
        handleClick(e);
        e.stopPropagation();
      }} // Pass handleClick to onClick
      aria-haspopup='dialog'
      aria-expanded={false}
    >
      {/* Dashed border when panel is open */}
      <motion.div
        className='absolute left-0 top-0 z-10 size-full'
        style={{ borderRadius: 'inherit' }}
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
        animate={{ opacity: isOpen ? 0 : 1 }}
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
  const [panelWidth, setPanelWidth] = useState(0);

  // Use layout effect for immediate measurement
  useLayoutEffect(() => {
    if (contentRef.current) {
      setPanelWidth(contentRef.current.offsetWidth);
    }
  }, [isOpen]);

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

  const getPositionStyle = () => {
    if (!triggerRect) return { left: '50%', top: '50%' };

    switch (side) {
      case 'left':
        return {
          left: triggerRect.left,
          top: triggerRect.bottom + 8,
        };
      case 'right':
        return {
          left:
            panelWidth > 0 ? triggerRect.right - panelWidth : triggerRect.left, // Fallback to left position
          top: triggerRect.bottom + 8,
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
            onClick={(e) => e.stopPropagation()}
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
              ...getPositionStyle(),
              transformOrigin: 'top left',
              minWidth: 200, // Prevent panelWidth=0 on initial render
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
  onClick?: (e: React.MouseEvent) => void;
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
      onClick={onClick} // Pass onClick directly
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

interface FloatingPanelSubMenuProps {
  children: React.ReactNode;
  className?: string;
  title: string;
}

export function FloatingPanelSubMenu({
  children,
  className,
  title,
}: FloatingPanelSubMenuProps) {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <FloatingPanelButton
        className='flex w-full items-center justify-between rounded-[10px] px-4 py-2 text-left transition-colors hover:bg-muted'
        onClick={(e) => {
          e.stopPropagation();
          setIsSubMenuOpen(!isSubMenuOpen);
        }}
      >
        <span>{title}</span>
        <ChevronRight className='size-4' />
      </FloatingPanelButton>

      <AnimatePresence>
        {isSubMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className='absolute left-full top-0 ml-1'
          >
            <FloatingPanelContent
              className='w-[200px] rounded-lg border border-zinc-950/10 bg-white shadow-sm dark:border-zinc-50/10 dark:bg-zinc-800'
              side='right'
            >
              {/* Close Button */}
              <button
                className='absolute right-1 top-1 z-50 rounded-full p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSubMenuOpen(false);
                }}
              >
                <X className='size-4' />
              </button>

              <FloatingPanelBody className='p-1'>{children}</FloatingPanelBody>
            </FloatingPanelContent>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  FloatingPanelButton as SubMenu,
};
