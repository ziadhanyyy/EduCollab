import type React from 'react';

interface RoleCardProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function RoleCard({ active, onClick, icon, title, description }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-4 text-center transition-colors ${
        active
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
    >
      {icon}
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs">{description}</span>
    </button>
  );
}

export default RoleCard;
