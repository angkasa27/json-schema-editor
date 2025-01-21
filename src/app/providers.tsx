"use client";

import { FC } from "react";
import { RecoilProvider } from "@/providers/recoil/provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "@/components/ui/sonner";

const Providers: FC<{ children: any }> = ({ children }) => {
  return (
    <>
      <RecoilProvider>
        <TooltipProvider delayDuration={50}>{children}</TooltipProvider>
      </RecoilProvider>
      <Toaster />
      <ProgressBar
        height="4px"
        color="#000000"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};

export default Providers;
