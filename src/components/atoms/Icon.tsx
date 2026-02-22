import { CSSProperties } from 'react';

interface IconProps {
  name: string;
  className?: string;
  style?: CSSProperties;
}

export default function Icon({ name, className = '', style }: IconProps) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}
