"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative rounded-full border border-transparent dark:bg-black dark:border-white/[0.2] bg-white shadow-input flex justify-center space-x-4 px-8 py-6 "
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </Link>
  );
};

export function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={`fixed top-10 inset-x-0 max-w-2xl mx-auto z-[100] ${className}`}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Shop">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/shop/electronics">Electronics</HoveredLink>
            <HoveredLink href="/shop/fashion">Fashion</HoveredLink>
            <HoveredLink href="/shop/home">Home & Garden</HoveredLink>
            <HoveredLink href="/shop/sports">Sports</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Experience">
          <div className="text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Virtual Tours"
              href="/virtual-tours"
              src="https://assets.aceternity.com/demos/algochurn.webp"
              description="Explore stores in immersive 360° environments"
            />
            <ProductItem
              title="3D Products"
              href="/3d-products"
              src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
              description="Interactive 3D models of products"
            />
            <ProductItem
              title="AR Try-On"
              href="/ar-try-on"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
              description="Try products before you buy with AR"
            />
            <ProductItem
              title="AI Assistant"
              href="/ai-assistant"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
              description="Get personalized shopping recommendations"
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Account">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/auth/login">Sign In</HoveredLink>
            <HoveredLink href="/auth/sign-up">Sign Up</HoveredLink>
            <HoveredLink href="/profile">My Profile</HoveredLink>
            <HoveredLink href="/orders">My Orders</HoveredLink>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
