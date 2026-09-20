'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ControlTooltip } from '@/components/ui/control-tooltip';

type InviteButtonProps = {
  invitePath?: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
};

export function InviteButton({
  invitePath,
  label = 'Copy invite link',
  iconOnly = false,
  className,
}: InviteButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(new URL(invitePath ?? window.location.pathname, window.location.origin).href);
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setFailed(true);
    }
  };

  const actionLabel = copied
    ? 'Invite link copied'
    : failed
      ? 'Copy invite link failed'
      : label;

  const button = (
    <Button
      type="button"
      variant="secondary"
      size={iconOnly ? 'icon' : 'default'}
      className={className}
      onClick={() => void copyInvite()}
      aria-label={actionLabel}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {!iconOnly && (copied ? 'Link copied' : label)}
    </Button>
  );

  return iconOnly ? (
    <ControlTooltip label={actionLabel}>{button}</ControlTooltip>
  ) : (
    button
  );
}
