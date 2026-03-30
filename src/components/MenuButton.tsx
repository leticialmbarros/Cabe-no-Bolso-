import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  badge?: number;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ icon, title, description, onClick, badge }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 text-left hover:border-gray-300 transition-all active:scale-[0.98]"
    >
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
          {badge !== undefined && (
            <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <ChevronRight className="text-gray-300" size={20} />
    </button>
  );
};
