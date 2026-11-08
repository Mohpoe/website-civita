import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiInstagram as Instagram, SiWhatsapp } from "react-icons/si";
import { TfiLinkedin } from "react-icons/tfi";

export function PublicFooter() {
  return (
    <footer className="bg-background border-t-4 border-foreground pt-16 pb-32 md:pb-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-6">
        <div className="flex flex-col gap-6">
          <Link href={ROUTES.ROOT} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ef3936] dark:bg-[#d9302d] border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground rounded-xl flex items-center justify-center">
              <Image alt="Logo" src="https://qaupjj2m3j2vqts9.public.blob.vercel-storage.com/assets/Icon.svg" className="size-5 [filter:brightness(0)_invert(1)]" width={1} height={1} />
            </div>
            <span className="font-black tracking-tight text-2xl uppercase">CIVITA.ID</span>
          </Link>

          <div className="flex flex-col gap-4 text-base font-bold">
            <a href={APP_CONFIG.LINKS.WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#ef3936] dark:hover:text-[#d9302d] transition-colors bg-muted w-max px-4 py-2 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground">
              <SiWhatsapp className="w-5 h-5" /> +{APP_CONFIG.WHATSAPP}
            </a>
            <a href={APP_CONFIG.LINKS.EMAIL} className="flex items-center gap-3 hover:text-[#f68e51] dark:hover:text-[#d97941] transition-colors bg-muted w-max px-4 py-2 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground">
              <Mail className="w-5 h-5" /> civitakerja@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 text-base font-black">
          <a href={APP_CONFIG.LINKS.INSTAGRAM} target="_blank" rel="noreferrer" className="hover:bg-[#ef3936] dark:hover:bg-[#d9302d] hover:text-white bg-background border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground px-5 py-3 rounded-full transition-all flex items-center gap-2">
            <Instagram className="w-5 h-5" /> Instagram
          </a>
          <a href={APP_CONFIG.LINKS.LINKEDIN} target="_blank" rel="noreferrer" className="hover:bg-[#f68e51] dark:hover:bg-[#d97941] hover:text-black bg-background border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground px-5 py-3 rounded-full transition-all flex items-center gap-2">
            <TfiLinkedin className="w-5 h-5" /> LinkedIn
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t-4 border-foreground flex flex-col md:flex-row justify-between items-center gap-6 font-bold text-sm">
        <p>© {new Date().getFullYear()} <a href="https://mohpoe.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ef3936] dark:hover:text-[#d9302d] underline decoration-2">Mohpoe</a>. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <Link href={ROUTES.TERMS} className="hover:text-[#ef3936] dark:hover:text-[#d9302d] underline decoration-2 underline-offset-4">Syarat & Ketentuan</Link>
          <Link href={ROUTES.POLICY} className="hover:text-[#f68e51] dark:hover:text-[#d97941] underline decoration-2 underline-offset-4">Kebijakan Privasi</Link>
        </div>
      </div>
    </footer>
  );
}
