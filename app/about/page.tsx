"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <Button
            variant="ghost"
            className="pl-0 gap-2 hover:bg-transparent hover:text-pink-400"
          >
            <ArrowLeft size={16} />
            Back to Rizz Lab
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Heart className="text-red-500" size={32} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              About Rizz Lab
            </h1>
          </div>
          <p className="text-gray-400 max-w-xl mx-auto">
            Your personal AI-powered flirting coach helping you build
            confidence, create connections, and master the art of conversation.
          </p>
        </div>

        <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-xl p-6 border border-pink-500/20">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Our Mission
          </h2>
          <p className="text-gray-300 mb-4">
            Rizz Lab was created to help people build confidence in social
            interactions. We believe that effective communication is a skill
            that can be learned and improved, just like any other.
          </p>
          <p className="text-gray-300">
            Through our AI-powered feedback system, we provide a safe, private
            space to practice and refine your conversation skills without the
            fear of real-world rejection or awkwardness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-xl p-6 border border-pink-500/20">
            <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex gap-2 items-start">
                <span className="bg-pink-500/20 text-pink-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                  1
                </span>
                <span>Input your pickup line or flirting message</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="bg-pink-500/20 text-pink-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                  2
                </span>
                <span>
                  Our AI analyzes your approach for creativity, confidence, and
                  authenticity
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="bg-pink-500/20 text-pink-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                  3
                </span>
                <span>Receive detailed scores and personalized feedback</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="bg-pink-500/20 text-pink-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                  4
                </span>
                <span>Use our tips to improve and try again</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-xl p-6 border border-pink-500/20">
            <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Privacy & Ethics
            </h2>
            <p className="text-gray-300 mb-3">
              We take your privacy seriously. All conversations with our AI are
              private and not stored permanently.
            </p>
            <p className="text-gray-300 mb-3">
              Our AI is designed to promote respectful, consensual
              communication. We do not support or encourage inappropriate
              messaging.
            </p>
            <p className="text-gray-300">
              Rizz Lab aims to help you be your best, authentic self - not turn
              you into someone you're not.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-gray-400 mb-4">
            Ready to test and improve your rizz?
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-none">
              Try the Rizz Evaluator
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
