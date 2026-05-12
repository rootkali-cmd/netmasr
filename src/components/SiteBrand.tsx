"use client";

import Image from "next/image";

export default function SiteBrand() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="NetMasr.org logo"
        width={42}
        height={42}
        priority
        className="h-9 w-9 rounded-full object-cover shadow-md md:h-10 md:w-10"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-base font-black text-gray-900 md:text-lg">
          نت مصر
        </span>
        <span className="text-xs font-semibold text-gray-500 md:text-sm">
          NetMasr.org
        </span>
      </div>
    </div>
  );
}