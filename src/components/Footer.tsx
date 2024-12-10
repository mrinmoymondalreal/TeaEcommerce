import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "lucide-react";
import { NLink } from "./Header";

export function Footer() {
  return (
    <footer className="relative w-full px-6 h-[30vh] flex flex-col space-y-10 justify-center items-center text-slate-100 overflow-hidden">
      <div className="flex gap-x-6 max-w-6xl mx-auto">
        <div className="flex-1">
          This Website is to demostrate the skills of the developer. This fuck
          website does not sell or own any of the products listed here.
          <span className="block mt-2">
            Made with ❤️ by{" "}
            <a
              href="https://www.github.com/mrinmoymondalreal"
              className="underline"
            >
              Mrinmoy Mondal
            </a>
          </span>
        </div>
        <div className="flex-1 flex flex-col items-end">
          <h1>Quick Links</h1>
          <ul className="space-x-2 flex w-fit">
            <NLink href="/">Home</NLink>
            <NLink href="/products">Product</NLink>
            <NLink href="/about">About</NLink>
            <NLink href="/contact">Contact</NLink>
          </ul>
        </div>
      </div>
      <div className="z-[1]">
        <div className="flex space-x-4 mt-4">
          <a
            href="https://github.com/mrinmoymondalreal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="w-6 h-6" />
          </a>
          <a
            href="https://twitter.com/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterIcon className="w-6 h-6" />
          </a>
          <a
            href="https://linkedin.com/in/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedinIcon className="w-6 h-6" />
          </a>
          <a
            href="https://instagram.com/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon className="w-6 h-6" />
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 uppercase pointer-events-none text-[10rem] w-full font-bold text-slate-700/40 -translate-x-10 translate-y-20">
        Tea & We
      </div>
    </footer>
  );
}
