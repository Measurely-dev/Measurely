"use client";

import { cn } from "@/lib/utils";
import * as Portal from "@radix-ui/react-portal";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  Dispatch,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  SetStateAction,
} from "react";
import { createPortal } from "react-dom";

interface DialogStackContextType {
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  totalDialogs: number;
  setTotalDialogs: (total: number) => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  clickable: boolean;
  closeDialog: () => void; // Add closeDialog to context type
  openDialog: () => void; // Add openDialog to context type
}

export const DialogStackContext = createContext<
  DialogStackContextType | undefined
>(undefined);

type DialogStackChildProps = {
  index?: number;
};
export const DialogStack = ({
  children,
  className,
  open = false,
  onOpenChange,
  clickable = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  clickable?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(open);

  // Wrap the original setIsOpen to reset index when closing
  const wrappedSetIsOpen: Dispatch<SetStateAction<boolean>> = (value) => {
    setIsOpen((prevState) => {
      const newState = typeof value === "function" ? value(prevState) : value;
      if (!newState) {
        setActiveIndex(0); // Reset index to 0 when closing
      }
      return newState;
    });
  };

  // Sync state with open prop only if needed (one-time sync on mount)
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Call onOpenChange only if the state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const closeDialog = () => {
    setIsOpen(false); // Close the dialog
    setActiveIndex(0); // Reset to the first dialog
  };

  const openDialog = () => {
    setIsOpen(true); // Open the dialog
  };

  return (
    <DialogStackContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        totalDialogs: 0,
        setTotalDialogs: () => {},
        isOpen,
        setIsOpen: wrappedSetIsOpen,
        clickable,
        closeDialog, // Provide closeDialog in context
        openDialog, // Provide openDialog in context
      }}
    >
      <div className={className} {...props}>
        {children}
      </div>
    </DialogStackContext.Provider>
  );
};
export const DialogStackTrigger = ({
  children,
  className,
  onClick,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
  const context = useContext(DialogStackContext);

  if (!context) {
    throw new Error("DialogStackTrigger must be used within a DialogStack");
  }

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    context.setIsOpen(true);
    onClick?.(e);
  };

  if (asChild && children) {
    return cloneElement(
      children as ReactElement<{
        onClick?: MouseEventHandler<HTMLElement>;
        className?: string;
      }>,
      {
        onClick: handleClick,
        className: cn(
          className,
          (children as ReactElement<{ className?: string }>).props.className,
        ),
        ...props,
      },
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-10 px-4 py-2",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const DialogStackOverlay = ({
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const context = useContext(DialogStackContext);

  if (!context) {
    throw new Error("DialogStackOverlay must be used within a DialogStack");
  }

  if (!context.isOpen) {
    return null;
  }
  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[100] bg-black/30"
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...props}
    />,
    document.body,
  );
};

export const DialogStackBody = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children:
    | ReactElement<DialogStackChildProps>[]
    | ReactElement<DialogStackChildProps>;
}) => {
  const context = useContext(DialogStackContext);
  const [totalDialogs, setTotalDialogs] = useState(Children.count(children));

  if (!context) {
    throw new Error("DialogStackBody must be used within a DialogStack");
  }

  if (!context.isOpen) {
    return null;
  }

  return (
    <DialogStackContext.Provider
      value={{
        ...context,
        totalDialogs,
        setTotalDialogs,
      }}
    >
      <Portal.Root>
        <div
          className={cn(
            "pointer-events-none fixed inset-0 z-50 mx-auto flex w-full max-w-lg flex-col items-center justify-center",
            className,
          )}
          {...props}
        >
          <div className="pointer-events-auto relative flex w-full flex-col items-center justify-center">
            {Children.map(children, (child, index) =>
              cloneElement(child as ReactElement<DialogStackChildProps>, {
                index,
              }),
            )}
          </div>
        </div>
      </Portal.Root>
    </DialogStackContext.Provider>
  );
};

export const DialogStackContent = ({
  children,
  className,
  index = 0,
  offset = 10,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  index?: number;
  offset?: number;
}) => {
  const context = useContext(DialogStackContext);

  if (!context) {
    throw new Error("DialogStackContent must be used within a DialogStack");
  }

  if (!context.isOpen) {
    return null;
  }

  const handleClick = () => {
    if (context.clickable && context.activeIndex > index) {
      context.setActiveIndex(index ?? 0);
    }
  };

  const distanceFromActive = index - context.activeIndex;
  const translateY =
    distanceFromActive < 0
      ? `-${Math.abs(distanceFromActive) * offset}px`
      : `${Math.abs(distanceFromActive) * offset}px`;

  return (
    // biome-ignore lint/nursery/noStaticElementInteractions: "This is a clickable dialog"
    <div
      onClick={handleClick}
      className={cn(
        "pointer-events-auto h-auto w-full select-auto rounded-2xl border bg-background p-6 shadow-lg transition-all duration-300",
        className,
      )}
      style={{
        top: 0,
        transform: `translateY(${translateY})`,
        overflow: distanceFromActive ? "hidden" : "visible",
        width: `calc(100% - ${Math.abs(distanceFromActive) * 10}px)`,
        zIndex: 50 - Math.abs(context.activeIndex - (index ?? 0)),
        position: distanceFromActive ? "absolute" : "relative",
        opacity: distanceFromActive > 0 ? 1 : 1, // Set opacity to 1 for all content
        height: distanceFromActive ? "100%" : "",
        cursor:
          context.clickable && context.activeIndex > index ? "pointer" : "auto",
      }}
      {...props}
    >
      {distanceFromActive ? (
        <div className="absolute bottom-0 left-0 size-full rounded-2xl bg-background" />
      ) : (
        <></>
      )}
      <div
        className={cn(
          "h-full w-full transition-all duration-300",
          context.activeIndex !== index &&
            "pointer-events-auto cursor-auto select-auto opacity-100", // Enable interaction
        )}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogStackTitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  >
    {children}
  </h2>
);

export const DialogStackDescription = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const DialogStackHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);

export const DialogStackFooter = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center justify-end space-x-2 pt-4", className)}
    {...props}
  >
    {children}
  </div>
);

export const DialogStackNext = ({
  children,
  className,
  asChild,
  ...props
}: {
  asChild?: boolean;
} & HTMLAttributes<HTMLButtonElement>) => {
  const context = useContext(DialogStackContext);

  if (!context) {
    throw new Error("DialogStackNext must be used within a DialogStack");
  }

  const handleNext = () => {
    if (context.activeIndex < context.totalDialogs - 1) {
      context.setActiveIndex(context.activeIndex + 1);
    }
  };

  if (asChild && children) {
    return cloneElement(
      children as ReactElement<{
        onClick?: MouseEventHandler<HTMLElement>;
        className?: string;
      }>,
      {
        onClick: handleNext,
        className: cn(
          className,
          (children as ReactElement<{ className?: string }>).props.className,
        ),
        ...props,
      },
    );
  }

  return (
    <button
      type="button"
      onClick={handleNext}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      disabled={context.activeIndex >= context.totalDialogs - 1}
      {...props}
    >
      {children || "Next"}
    </button>
  );
};

export const DialogStackPrevious = ({
  children,
  className,
  asChild,
  ...props
}: {
  children?: ReactNode;
  className?: string;
  asChild?: boolean;
} & HTMLAttributes<HTMLButtonElement>) => {
  const context = useContext(DialogStackContext);

  if (!context) {
    throw new Error("DialogStackPrevious must be used within a DialogStack");
  }

  const handlePrevious = () => {
    if (context.activeIndex > 0) {
      context.setActiveIndex(context.activeIndex - 1);
    }
  };

  if (asChild && children) {
    return cloneElement(
      children as ReactElement<{
        onClick?: MouseEventHandler<HTMLElement>;
        className?: string;
      }>,
      {
        onClick: handlePrevious,
        className: cn(
          className,
          (children as ReactElement<{ className?: string }>).props.className,
        ),
        ...props,
      },
    );
  }

  return (
    <button
      type="button"
      onClick={handlePrevious}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      disabled={context.activeIndex <= 0}
      {...props}
    >
      {children || "Previous"}
    </button>
  );
};

export const DialogStackClose = ({
  children,
  className,
  asChild,
  onClick,
  ...props
}: {
  asChild?: boolean;
} & HTMLAttributes<HTMLButtonElement>) => {
  const context = useContext(DialogStackContext);

  if (!context) {
    throw new Error("DialogStackClose must be used within a DialogStack");
  }

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    context.setIsOpen(false);
    context.setActiveIndex(0);
    onClick?.(event);
  };

  if (asChild && children) {
    return cloneElement(
      children as ReactElement<{
        onClick?: MouseEventHandler<HTMLElement>;
        className?: string;
      }>,
      {
        onClick: handleClose,
        className: cn(
          className,
          (children as ReactElement<{ className?: string }>).props.className,
        ),
        ...props,
      },
    );
  }

  return (
    <button
      type="button"
      onClick={handleClose}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children || "Close"}
    </button>
  );
};
