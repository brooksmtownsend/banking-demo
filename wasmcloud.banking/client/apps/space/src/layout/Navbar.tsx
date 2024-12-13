import React from 'react';
import {ScanEyeIcon} from 'lucide-react';
import {useConfig} from '@repo/common/services/config/useConfig';
import {Card} from '@repo/ui/Card';
import {Heading} from '@repo/ui/Heading';
import {cn} from '@repo/ui/cn';
import {ThemeToggle} from '@repo/ui/theme/ThemeToggle';

const Navbar = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  ({className, ...props}, ref) => {
    const config = useConfig();

    return (
      <Card
        className={cn(
          'p-2 my-4 self-center w-full min-w-min sm:w-[380px] md:min-w-[640px]',
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="flex gap-4 justify-between items-center">
          <Heading className="text-base font-medium ms-2 me-auto">{config.appName}</Heading>

          <nav className="hidden items-center justify-center gap-2 sm:flex">
            <NavButton href="/" active>
              <ScanEyeIcon className="w-4 h-4 mr-2" />
              Image Detection
            </NavButton>
            {/* 
            <NavButton href="#coming-soon" disabled>
              <SquareActivityIcon className="w-4 h-4 mr-2" />
              Health Status
            </NavButton>
            */}
          </nav>

          <ThemeToggle />
        </div>
      </Card>
    );
  },
);

type NavButtonProps = {
  active?: boolean;
} & React.HTMLProps<HTMLAnchorElement>;

const NavButton = React.forwardRef<HTMLAnchorElement, NavButtonProps>(
  ({active, className, disabled, ...props}, ref) => {
    return (
      <a
        className={cn(
          'text-xs flex items-center px-3 py-1 rounded-md border border-border-surface whitespace-nowrap',
          active ? 'bg-surface-contrast/5' : 'hover:bg-surface-contrast/10',
          disabled && 'opacity-50 cursor-not-allowed hover:bg-surface-contrast/0',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

export {Navbar};
