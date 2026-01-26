import type { FC } from "react";

import Spinner from "./spinner";

const LoadingPage: FC = () => {
  return <Spinner cls="flex-1 w-screen w-full h-screen h-full flex items-center justify-center" size={32} />;
};

export default LoadingPage;
