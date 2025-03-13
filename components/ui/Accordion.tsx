'use client';

import React from 'react';

interface AccordionContextType {
  selectedItem: string | null;
  setSelectedItem: (value: string | null) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  children,
  type = 'single',
  collapsible = true,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  return (
    <AccordionContext.Provider value={{ selectedItem, setSelectedItem }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ 
  children,
  value,
  className = ''
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface AccordionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AccordionButton: React.FC<AccordionButtonProps> = ({ 
  children,
  onClick,
  className = ''
}) => {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
};

interface AccordionPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const AccordionPanel: React.FC<AccordionPanelProps> = ({ 
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};