import React from "react";
import { WifiHigh, Bell, User } from "lucide-react";

export const Topbar = () => {
  return (
    <div className="w-full h-16 px-6 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-b border-slate-300 inline-flex justify-between items-center">
      <div className="size- inline-flex flex-col justify-start items-start">
        <div className="justify-center text-sky-700 text-2xl font-bold font-['Inter'] leading-8">
          Dashboard
        </div>
      </div>
      <div className="size- flex justify-start items-center gap-4">
        <div className="size- px-3 py-1 rounded-full outline outline-1 outline-offset-[-1px] outline-green-600 flex justify-start items-center gap-2">
            <WifiHigh className="text-green-600 relative -top-0.75"/>
          <div className="justify-center text-green-600 text-sm font-normal font-['Inter'] leading-5">
            AI Camera: Online
          </div>
        </div>
        <div className="size- pb-1.5 inline-flex flex-col justify-center items-center">
          <Bell className="text-[#3E4850] relative top-0.5"/>
        </div>
        <div className="size-8 bg-indigo-100 rounded-full outline outline-1 outline-offset-[-1px] outline-slate-300 flex justify-center items-center overflow-hidden">
          <User className="size-4 text-[#006591]"/>
        </div>
      </div>
    </div>
  );
};
