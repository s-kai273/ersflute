import { cn } from "../../../utils/cn";
import { GridBackgroundProps } from "./type";

export function GridBackground({ className, ...props }: GridBackgroundProps) {
  return (
    <svg {...props} className={cn("pointer-events-none", className)}>
      <defs>
        <pattern
          id="smallGrid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#ccc"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#smallGrid)" />
    </svg>
  );
}
