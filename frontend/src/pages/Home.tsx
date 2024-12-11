import { SmoothScrollHero } from "@/components/ParallaxSection";

export async function loader() {
  return await fetch(`${import.meta.env.VITE_BACKEND}/api/hero_products`).then(
    (e) => e.json()
  );
}

export const element = <SmoothScrollHero />;
