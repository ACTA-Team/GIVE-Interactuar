'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SidebarNavGroupProps {
  icon: ReactNode;
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function SidebarNavGroup({
  icon,
  label,
  defaultOpen = false,
  children,
}: SidebarNavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
      >
        <span className="shrink-0 text-gray-500">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="text-gray-400"
        >
          <IconChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn('overflow-hidden')}
          >
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-gray-200 pl-3 pb-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
