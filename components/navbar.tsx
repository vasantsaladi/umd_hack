"use client";

import { Button } from "./ui/button";
import { HeartIcon } from "lucide-react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="p-3 flex flex-row gap-2 justify-between items-center border-b border-gray-800/30">
      <div className="flex items-center gap-2">
        <HeartIcon className="text-red-500" size={20} />
        <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hidden md:inline">
          Rizz Lab
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/about">
          <Button
            variant="ghost"
            className="text-sm hover:bg-pink-500/10 hover:text-pink-400 transition-colors"
          >
            About
          </Button>
        </Link>

        <Link href="/tips">
          <Button
            variant="ghost"
            className="text-sm hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
          >
            Rizz Tips
          </Button>
        </Link>
      </div>
    </div>
  );
};
