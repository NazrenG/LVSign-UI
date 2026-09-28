import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CURRENT_USER } from "@/data/people";
import { useDisclosure } from "@/hooks/useDisclosure";
import { MobileHeader } from "./MobileHeader";
import { Sidebar } from "./Sidebar";

/**
 * Shell for every authenticated page with navigation:
 * Sidebar (left) + routed page content (<Outlet />).
 */
export function AppLayout() {
  const { isOpen, open, close } = useDisclosure();
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => close(), [pathname, close]);

  return (
    <div className="min-h-screen">
      <Sidebar user={CURRENT_USER} isOpen={isOpen} onClose={close} />

      <div className="lg:pl-[284px]">
        <MobileHeader onMenuClick={open} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
