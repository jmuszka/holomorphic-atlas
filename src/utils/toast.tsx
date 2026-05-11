import React from "react";
import { Info, Bell, Clipboard } from "lucide-react";

export interface IToast {
  display: boolean;
  icon: React.ReactNode;
  title: React.ReactNode;
  body: React.ReactNode;
}

export const ToastTip: IToast = {
  display: true,
  icon: <Bell size={20} />,
  title: "New explorer?",
  body: (
    <>
      Click the <Info size={14} className="inline mb-0.5" /> icon in the control
      panel to see controls and learn the math!
    </>
  ),
};

export const ToastCopied: IToast = {
  display: true,
  icon: <Clipboard size={20} />,
  title: "Copied to clipboard",
  body: "Paste the link to share this view of the atlas!",
};
