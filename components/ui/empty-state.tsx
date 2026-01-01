import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    actionLabel,
    actionHref,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800",
            className
        )}>
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link href={actionHref}>
                    <Button>
                        {actionLabel}
                    </Button>
                </Link>
            )}
        </div>
    );
}
