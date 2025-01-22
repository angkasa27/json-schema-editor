"use client";

import { FC } from "react";
import { RecoilProvider } from "@/providers/recoil/provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const Providers: FC<{ children: any }> = ({ children }) => {
  return (
    <>
      <RecoilProvider>
        <TooltipProvider delayDuration={50}>{children}</TooltipProvider>
      </RecoilProvider>
      <Toaster />
    </>
  );
};

export default Providers;
