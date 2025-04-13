"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  SquaresPlusIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass-card p-6 h-full">
                <div className="flex items-center mb-4">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-pink-500 mr-2" />
                  <h3 className="text-xl font-semibold text-white">
                    Personalized Feedback
                  </h3>
                </div>
                <p className="text-gray-300">
                  Get instant AI-powered evaluations on your flirting techniques
                  and conversation starters, with tips to improve.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card p-6 h-full">
                <div className="flex items-center mb-4">
                  <SquaresPlusIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="text-xl font-semibold text-white">
                    Interactive Scenarios
                  </h3>
                </div>
                <p className="text-gray-300">
                  Practice in realistic dating environments with our interactive
                  simulations and real-time vocal responses.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-6 h-full relative overflow-hidden">
                <div className="absolute -right-1 -top-1">
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs px-2 py-1 rounded-bl-md font-medium">
                    NEW
                  </span>
                </div>
                <div className="flex items-center mb-4">
                  <PhotoIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <h3 className="text-xl font-semibold text-white">
                    DALL-E 3 Visuals
                  </h3>
                </div>
                <p className="text-gray-300">
                  Experience stunning AI-generated images of your dating
                  scenarios, powered by cutting-edge DALL-E 3 technology for
                  better visual storytelling.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
