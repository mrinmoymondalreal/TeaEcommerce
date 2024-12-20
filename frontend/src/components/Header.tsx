import { cn } from "@/lib/utils";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { cartVisibilityAtom } from "./Cart";
import { cartAtom } from "@/lib/store";
import { Link, useLoaderData } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const MenuAtom = atom(false);

export function Header() {
  return <MainPageHeader className="top-0 to-zinc-900" />;
}

export function NLink({
  href,
  children,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      to={href || "#"}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {children}
      <div className="absolute w-0 h-px bg-slate-100 group-hover:w-full transition-all"></div>
    </Link>
  );
}

const slideInParent = {
  initial: { x: "100%" },
  animate: {
    x: "0",
    transition: { staggerChildren: 0.3, duration: 0.5, ease: "easeInOut" },
  },
  exit: { x: "100%" },
};

const slideInChild = {
  initial: { opacity: 0, x: "100%" },
  animate: {
    opacity: 1,
    x: "0",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: { x: "100%" },
};

function FullScreenMenu() {
  const [isVisible, setVisible] = useAtom(MenuAtom);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={slideInParent}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 w-full bg-zinc-950 z-[100] flex justify-center items-center"
        >
          <div className="absolute inset-7">
            <X size={40} onClick={() => setVisible(false)} />
          </div>
          <div className="flex flex-col text-4xl space-y-4">
            {[
              ["/", "Home"],
              ["/products", "Product"],
              ["/about", "About"],
              ["orders", "Orders"],
            ].map(([href, text], index) => (
              <motion.div
                onClick={() => setVisible(false)}
                variants={slideInChild}
              >
                <NLink href={href} key={index}>
                  {text}
                </NLink>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MainPageHeader({ className }: { className?: string }) {
  const setCartVisible = useSetAtom(cartVisibilityAtom);

  const cart = useAtomValue(cartAtom);

  const isUserAuth = useLoaderData() as { ok: boolean };

  const setMenuVisible = useSetAtom(MenuAtom);

  return (
    <>
      <FullScreenMenu />
      {/* Mobile Header */}
      <header
        className={cn(
          "fixed md:hidden z-[99] w-full text-slate-100 bg-gradient-to-t from-zinc-950/0 to-zinc-950",
          className
        )}
      >
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full px-5 py-4">
          <div className="flex">
            <span className="text-2xl font-black">
              <Link to="/">TEA & WE</Link>
            </span>
          </div>
          <div>
            <ul className="h-min flex items-center space-x-4">
              <NLink
                onClick={(e) => {
                  e.preventDefault();
                  setCartVisible(true);
                }}
              >
                cart ({cart.reduce((acc, cur) => cur.quantity + acc, 0)})
              </NLink>
              <li>
                {isUserAuth ? (
                  <NLink
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `${import.meta.env.VITE_BACKEND}/api/auth/signout`;
                    }}
                    href={`${import.meta.env.VITE_BACKEND}/api/auth/signout`}
                  >
                    signout
                  </NLink>
                ) : (
                  <NLink
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `${import.meta.env.VITE_BACKEND}/api/auth/signin`;
                    }}
                    href={`${import.meta.env.VITE_BACKEND}/api/auth/signin`}
                  >
                    signin
                  </NLink>
                )}
              </li>
              <li>
                <Menu size={24} onClick={() => setMenuVisible(true)} />
              </li>
            </ul>
          </div>
        </div>
      </header>
      {/* Desktop Header */}
      <header
        className={cn(
          "fixed hidden md:block z-[99] w-full text-slate-100 bg-gradient-to-t from-zinc-950/0 to-zinc-950",
          className
        )}
      >
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full px-5 py-4">
          <div className="flex">
            <span className="text-2xl font-black">
              <Link to="/">TEA & WE</Link>
            </span>
          </div>
          <div className="hidden md:block">
            <ul className="*:inline-block space-x-4">
              <NLink href="/">Home</NLink>
              <NLink href="/products">Product</NLink>
              <NLink href="/about">About</NLink>
              <NLink href="/orders">Orders</NLink>
            </ul>
          </div>
          <div>
            <ul className="h-min flex items-center space-x-4">
              <NLink
                onClick={(e) => {
                  e.preventDefault();
                  setCartVisible(true);
                }}
              >
                cart ({cart.reduce((acc, cur) => cur.quantity + acc, 0)})
              </NLink>
              <li>
                {isUserAuth ? (
                  <NLink
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `${import.meta.env.VITE_BACKEND}/api/auth/signout`;
                    }}
                    href={`${import.meta.env.VITE_BACKEND}/api/auth/signout`}
                  >
                    signout
                  </NLink>
                ) : (
                  <NLink
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `${import.meta.env.VITE_BACKEND}/api/auth/signin`;
                    }}
                    href={`${import.meta.env.VITE_BACKEND}/api/auth/signin`}
                  >
                    signin
                  </NLink>
                )}
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
