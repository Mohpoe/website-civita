"use client";

import { ModeToggle } from "@/components/theme-toggle-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

const CONSULT_MESSAGE = "Halo admin CIVITA, saya ingin konsultasi terkait pembuatan CV yang ATS-friendly.";

export function PublicNavigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`
        pointer-events-auto flex items-center justify-between px-5 md:px-6 py-3 md:py-3.5 rounded-full transition-all duration-500 border-4 border-transparent shadow-[4px_4px_0px_0px] shadow-foreground
        ${scrolled ? "bg-background/80 backdrop-blur-md w-full max-w-3xl !border-2 !border-foreground" : "bg-background md:bg-background border-foreground w-full max-w-6xl"}
      `}
      >
        <Link href={ROUTES.ROOT} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center shadow-inner">
            <Image
              alt="Logo"
              src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg"
              className="size-4 [filter:brightness(0)_invert(1)] dark:[filter:brightness(0)]"
              width={1}
              height={1}
            />
          </div>
          <span className="font-black tracking-tight text-xl">CIVITA.ID</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button variant="outline" className="h-10 px-5 font-bold rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
                <Button className="h-10 px-5 font-bold rounded-full bg-[#f68e51] dark:bg-[#d97941] text-black border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
                  Daftar
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href={ROUTES.DASHBOARD.HOME} className={buttonVariants({ className: "h-10 px-5 font-bold !rounded-full !border-2 !border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all mr-2 !bg-[#f68e51] dark:!bg-[#d97941] !text-black" })}>
                Dashboard
              </Link>
            </Show>
          </div>

          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-foreground mx-1" />

          <Button onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP_CHAT(CONSULT_MESSAGE), "_blank")} className="hidden md:flex h-10 px-5 rounded-full font-bold bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] transition-all">
            Konsultasi <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <ModeToggle />
        </div>
      </div>
    </motion.header>
  );
}

export function PublicMobileBottomBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background border-t border-foreground p-3 flex items-center justify-between gap-3 shadow-[0px_-4px_0px_0px] shadow-foreground">
      <Show when="signed-out">
        <SignInButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
          <Button variant="outline" className="flex-1 h-12 rounded-full border-2 border-foreground font-bold shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all">
            Masuk
          </Button>
        </SignInButton>
        <SignUpButton mode="modal" fallbackRedirectUrl={ROUTES.DASHBOARD.HOME}>
          <Button className="flex-1 h-12 rounded-full border-2 border-foreground bg-[#f68e51] dark:bg-[#d97941] text-black font-bold shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all">
            Daftar
          </Button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <Link href={ROUTES.DASHBOARD.HOME} className={buttonVariants({ className: "flex-1 h-12 !rounded-full !border-2 font-bold !border-foreground shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all !bg-[#f68e51] dark:!bg-[#d97941] !text-black" })}>
          Dashboard
        </Link>
      </Show>

      <Button onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP_CHAT(CONSULT_MESSAGE), "_blank")} className="flex-none aspect-square p-0 w-12 h-12 rounded-full bg-[#ef3936] dark:bg-[#d9302d] text-white border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground active:translate-y-1 active:shadow-none transition-all" aria-label="Konsultasi WhatsApp">
        <SiWhatsapp className="w-6 h-6" />
      </Button>
    </div>
  );
}
