declare module "*.svg" {
  import type React from "react";
  import type { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.jpg" {
  export default string;
}

declare module "*.jpeg" {
  export default string;
}

declare module "*.png" {
  export default string;
}

declare module "*.webp" {
  export default string;
}

declare module "*.json" {
  export default string;
}
