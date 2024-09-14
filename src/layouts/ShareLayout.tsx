import { memo } from "react";
import { Outlet } from "@tanstack/react-router";

import Header from "@/components/Header";
import { scrollbarClasses } from "@/utils/classes";
import clsx from "clsx";

export const ShareLayout = memo(() => {
  return (
    <div className="flex flex-col-reverse md:flex-row h-dvh overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-x-hidden">
        <Header />
        <main
          className={clsx(
            "max-w-screen-2xl w-full mx-auto flex-1 overflow-y-auto overflow-x-hidden p-4 pb-2",
            scrollbarClasses,
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
});
