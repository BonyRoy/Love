import { Heart } from "lucide-react";

const ICON_SIZE = 18;
const ICON_STROKE = 2;

export function Icon({ icon: IconComponent, size = ICON_SIZE, className = "", ...props }) {
  return (
    <IconComponent
      size={size}
      strokeWidth={ICON_STROKE}
      className={`icon ${className}`.trim()}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Heart };
