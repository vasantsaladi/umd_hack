"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Download, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface RizzImageProps {
  imageUrl: string;
  prompt: string;
  context?: string;
  isLoading?: boolean;
}

export const RizzImage: FC<RizzImageProps> = ({
  imageUrl,
  prompt,
  context,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-background/50 backdrop-blur-lg rounded-xl p-4 shadow-md border border-pink-500/20 animate-pulse">
        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground opacity-25" />
        </div>
        <div className="mt-3 h-4 bg-muted rounded w-2/3"></div>
      </div>
    );
  }

  if (!imageUrl) {
    return null;
  }

  // Handle image download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `rizz-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format prompt to create a short caption (first 50 chars)
  const caption = prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-gray-900/70 to-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-pink-500/20 overflow-hidden"
    >
      <div className="p-3 border-b border-gray-700/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-pink-400" size={16} />
          <h3 className="text-sm font-medium">Rizz Visualization</h3>
        </div>
        <Button
          onClick={handleDownload}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-full"
        >
          <Download size={14} />
        </Button>
      </div>

      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={`AI generated visualization of: ${prompt}`}
          className="w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-xs text-gray-300 line-clamp-2">{caption}</p>
          {context && (
            <p className="text-xs text-pink-400 mt-1">Context: {context}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
