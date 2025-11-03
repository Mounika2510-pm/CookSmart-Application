import type { GridBaseProps } from "@mui/material/Grid";
import type { Breakpoint } from "@mui/system";

declare module "@mui/material/Grid" {
  interface GridBaseProps {
    item?: boolean;
    container?: boolean;
    xs?: boolean | number | "auto";
    sm?: boolean | number | "auto";
    md?: boolean | number | "auto";
    lg?: boolean | number | "auto";
    xl?: boolean | number | "auto";
    spacing?: number;
    key?: string;
  }
}
