"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const rizzTips = [
  {
    title: "Be Authentic",
    description:
      "The most attractive quality is authenticity. Be yourself and don't try to force lines that don't match your personality.",
    emoji: "🎭",
  },
  {
    title: "Show Genuine Interest",
    description:
      "Ask open-ended questions that show you're interested in getting to know them, not just impressing them with clever lines.",
    emoji: "👂",
  },
  {
    title: "Use Humor Wisely",
    description:
      "Humor is attractive, but ensure it's appropriate for the situation and person. Self-deprecating humor can be endearing in moderation.",
    emoji: "😂",
  },
  {
    title: "Be Confident, Not Arrogant",
    description:
      "Confidence is attractive, arrogance is not. There's a fine line between the two - maintain humility while being self-assured.",
    emoji: "💪",
  },
  {
    title: "Read the Room",
    description:
      "Pay attention to their reactions and body language. Know when to pivot if something isn't landing well.",
    emoji: "👀",
  },
  {
    title: "Create Meaningful Connections",
    description:
      "Find common interests and build conversation around those topics to create genuine connections.",
    emoji: "🔗",
  },
  {
    title: "Respect Boundaries",
    description:
      "Always be respectful and mindful of personal boundaries. If someone isn't responding positively, gracefully move on.",
    emoji: "🛑",
  },
  {
    title: "Be Present",
    description:
      "Put away distractions and focus on the conversation. Being fully present shows respect and genuine interest.",
    emoji: "🧘",
  },
  {
    title: "Mind Your Body Language",
    description:
      "Maintain good posture, appropriate eye contact, and an open stance. Your body communicates as much as your words.",
    emoji: "👤",
  },
  {
    title: "Practice Makes Perfect",
    description:
      "The more you practice social interactions, the more natural and confident you'll become. Use our Rizz Lab to hone your skills!",
    emoji: "🔄",
  },
];

export default function TipsPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
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
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
          Master Your Rizz Game
        </h1>
        <p className="text-gray-400 mb-8">
          These expert tips will help you elevate your flirting skills and make
          memorable connections.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rizzTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/20 rounded-xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{tip.emoji}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{tip.title}</h3>
                  <p className="text-gray-400 text-sm">{tip.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">
            Ready to put these tips into practice?
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
