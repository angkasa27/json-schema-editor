"use client";

import React from "react";
import { RecoilRoot } from "recoil";
import { RecoilExternalStatePortal } from "./recoil-external-state-portal";

export function RecoilProvider({ children }: React.PropsWithChildren) {
  return (
    <RecoilRoot>
      {children}
      <RecoilExternalStatePortal />
    </RecoilRoot>
  );
}

