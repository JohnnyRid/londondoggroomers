import React from 'react';
import { 
  getSpecializationIconType, 
  getSpecializationGradient,
  specializationIconData,
  SpecializationIconType
} from '../../lib/specializationUtils';

interface SpecializationIconProps {
  name: string;
  iconType?: SpecializationIconType;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  iconOnly?: boolean;
}

const SpecializationIcon: React.FC<SpecializationIconProps> = ({
  name,
  iconType,
  size = 'medium',
  className = '',
  iconOnly = false
}) => {
  // Use the provided iconType or determine it from the name
  const resolvedIconType: SpecializationIconType = iconType || getSpecializationIconType(name || '');
  const gradientClasses = getSpecializationGradient(resolvedIconType);
  const iconData = specializationIconData[resolvedIconType];
  
  // Get icon sizing based on the size prop
  const getSizing = () => {
    switch(size) {
      case 'small':
        return {
          wrapper: 'w-10 h-10',
          icon: 'h-6 w-6'
        };
      case 'large':
        return {
          wrapper: 'w-24 h-24',
          icon: 'h-14 w-14'
        };
      default: // medium
        return {
          wrapper: 'w-16 h-16',
          icon: 'h-10 w-10'
        };
    }
  };
  
  const sizing = getSizing();
  
  // If icon only, render just the SVG without the container
  if (iconOnly) {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${className || sizing.icon} ${iconData.color}`}
        viewBox={iconData.viewBox}
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {iconData.path.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </svg>
    );
  }
  
  // Return the icon with container
  return (
    <div className={`${sizing.wrapper} rounded-md bg-gradient-to-br ${gradientClasses} flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${sizing.icon} ${iconData.color}`}
        viewBox={iconData.viewBox}
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {iconData.path.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </svg>
    </div>
  );
};

export default SpecializationIcon;