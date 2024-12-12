import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function GlobalLoading() {
  const navigation = useNavigation();

  const [show, setShow] = useState(false);

  const [place, setPlace] = useState(0);

  useEffect(() => {
    if (navigation.state == "idle") setShow(false);
    if (navigation.state == "loading") setShow(true);
  }, [navigation.state]);

  const animationText = "Teeeea Annnnd Weee";

  useEffect(() => {
    if (navigation.state == "idle") return;

    const timeout = setTimeout(() => {
      setPlace((p) => (p + 1) % animationText.length);
    }, 100);

    return () => clearTimeout(timeout);
  });

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: show ? 0 : "100%" }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
      className="h-screen w-full fixed z-[10000] inset-0 max-w-screen flex flex-col space-y-6 justify-center items-center bg-zinc-950"
    >
      <h2 className="text-center text-5xl font-thin text-indigo-300">
        {animationText.split("").map((child, idx) => (
          <span
            className={cn("hoverText", place == idx && "hoverTextOn")}
            key={idx}
          >
            {child}
          </span>
        ))}
      </h2>
      <h6>Loading...</h6>
    </motion.div>
  );
}
