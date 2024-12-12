// @ts-ignore
import ReactLenis from "lenis/dist/lenis-react";
import { ArrowRight, MapPin } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { Footer } from "./Footer";

export const SmoothScrollHero = () => {
  return (
    <div className="bg-zinc-950">
      <ReactLenis
        root
        options={{
          // Learn more -> https://github.com/darkroomengineering/lenis?tab=readme-ov-file#instance-settings
          lerp: 0.05,
          //   infinite: true,
          //   syncTouch: true,
        }}
      >
        {/* <Nav /> */}
        <Hero />
        <Schedule />
        <Footer />
      </ReactLenis>
    </div>
  );
};

const SECTION_HEIGHT = 1500;

const Hero = () => {
  return (
    <>
      <CenterText />
      <div
        style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
        className="relative w-full"
      >
        <CenterImage />
        <ParallaxImages />

        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
      </div>
    </>
  );
};

function TextReveal({
  children,
  delay,
  duration,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.span
      className="block"
      animate={{
        y: ["100%", 0],
        transition: { duration: duration || 0.4, delay: delay || 0 },
      }}
    >
      {children}
    </motion.span>
  );
}

const CenterText = function () {
  const ref = useRef(null);

  let start = 0,
    end = 100;

  const { scrollYProgress } = useScroll({
    target: ref,
    // @ts-ignore
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);

  return (
    <motion.div
      className="mx-auto absolute top-0 left-0 z-[50] w-full h-screen flex justify-center items-center
      bg-gradient-to-t from-zinc-950/0 to-zinc-950"
      ref={ref}
      style={{ y, scale, opacity }}
    >
      <span className="*:overflow-hidden text-4xl lg:text-8xl -ml-24 md:text-6xl font-black uppercase text-white flex flex-col">
        <span>
          <TextReveal delay={0.1}>Taste of </TextReveal>
        </span>
        <span className="translate-x-14">
          <TextReveal delay={0.2}>Himalayas</TextReveal>
        </span>
        <span>
          <TextReveal delay={0.3}>In</TextReveal>
        </span>
        <span className="translate-x-36 -translate-y-8">
          <TextReveal delay={0.4}>Every Sip</TextReveal>
        </span>
      </span>
    </motion.div>
  );
};

const CenterImage = () => {
  const { scrollY } = useScroll();

  const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrollY,
    [0, SECTION_HEIGHT + 500],
    ["170%", "100%"]
  );
  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0]
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage:
          "url(https://images.unsplash.com/photo-1506832424678-e8232f4a068d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px]">
      <ParallaxImg
        src="https://plus.unsplash.com/premium_photo-1692049122910-d8b131ed54c1?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="And example of a space launch"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1713683623966-e2e2cc041a8c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="An example of a space launch"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1514733670139-4d87a1941d55?q=80&w=1778&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Orbiting satellite"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxImg
        src="https://plus.unsplash.com/premium_photo-1674406481284-43eba097a291?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Orbiting satellite"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
    </div>
  );
};

const ParallaxImg = ({
  className,
  alt,
  src,
  start,
  end,
}: {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
}) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // @ts-ignore
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      ref={ref}
      style={{ y, scale, opacity }}
    />
  );
};

const Schedule = () => {
  const { data } = useLoaderData() as {
    data: { image_urls: string[]; title: string }[];
  };

  let i = -1;

  return (
    <section
      id="launch-schedule"
      className="mx-auto max-w-5xl px-4 py-48 text-white"
    >
      <motion.h1
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="mb-20 text-4xl font-black uppercase text-zinc-50"
      >
        Popular Teas
      </motion.h1>
      <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 gap-x-0">
        <ScheduleItem
          title="Straight from Himalayas"
          date="Dec 9th"
          href={data[++i].title}
          image={data[i].image_urls[0]}
          location="Himalayas"
        />
        <ScheduleItem
          title="Best of the Best"
          date="Dec 20th"
          location="Himalayas"
          href={data[++i].title}
          image={data[i].image_urls[0]}
        />
        <ScheduleItem
          title="Taste of life"
          date="Jan 13th"
          location="India"
          href={data[++i].title}
          image={data[i].image_urls[0]}
        />
        <ScheduleItem
          title="Nature in Sip"
          date="Feb 22nd"
          location="Darjeeeling"
          href={data[++i].title}
          image={data[i].image_urls[0]}
        />
        <ScheduleItem
          title="Way to Pease"
          date="Mar 1st"
          location="Assam"
          href={data[++i].title}
          image={data[i].image_urls[0]}
        />
        <ScheduleItem
          title="Fresh Nature Taste"
          date="Mar 8th"
          location="India"
          href={data[++i].title}
          image={data[i].image_urls[0]}
        />
        <ScheduleItem
          title="Nice to Taste"
          date="Apr 8th"
          location="Dargeeling"
          href={data[++i].title}
          image={data[i].image_urls[0]}
        />
      </div>
      <div className="text-center">
        <Link
          to="products"
          className="text-2xl capitalize relative before:content-[''] before:bottom-0 before:-mb-1 before:h-px before:w-full before:bg-white before:absolute"
        >
          Explore more <ArrowRight className="inline-block -mt-px ml-2" />
        </Link>
      </div>
    </section>
  );
};

const ScheduleItem = ({
  title,
  date,
  location,
  image,
  href,
}: {
  title: string;
  date: string;
  location: string;
  image: string;
  href: string;
}) => {
  return (
    <Link to={"/p/" + href.toLowerCase().replace(/\s/g, "_")}>
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="mb-9  border-l border-zinc-800 px-4 space-y-2"
      >
        <div className="w-full aspect-[2/2.1] bg-gray-600">
          <img
            src={image}
            alt={href + "'s Image"}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex md:flex-row flex-col md:items-center justify-between">
          <div>
            <p className="mb-1.5 text-xl text-zinc-50">{title}</p>
            <p className="text-sm uppercase text-zinc-500">{date}</p>
          </div>
          <div className="flex items-center gap-1.5 text-end text-sm uppercase text-zinc-500">
            <p>{location}</p>
            <MapPin />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
