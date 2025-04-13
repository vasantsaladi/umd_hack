"use client";

import type { Message } from "ai";
import { motion } from "framer-motion";

import { SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { cn } from "@/lib/utils";
import { Weather } from "./weather";
import { RizzEvaluation } from "./rizz-evaluation";
import { RizzImage } from "./rizz-image";
import { DateSimulation } from "./date-simulation";

export const PreviewMessage = ({
  message,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cn(
          "group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl"
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {message.content && (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "get_current_weather" ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === "evaluate_rizz" ? (
                        <RizzEvaluation
                          evaluationResult={result}
                          userInput={result.message || ""}
                        />
                      ) : toolName === "generate_rizz_image" ? (
                        <RizzImage
                          imageUrl={result.url}
                          prompt={result.prompt}
                          context={result.context}
                        />
                      ) : toolName === "simulate_date" ? (
                        <DateSimulation simulationResult={result} />
                      ) : toolName === "transcribe_audio" ? (
                        <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                              Transcription
                            </span>
                          </div>
                          <p className="text-gray-300 italic">
                            &quot;{result.text}&quot;
                          </p>
                        </div>
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={toolCallId}
                    className={cn({
                      skeleton: [
                        "get_current_weather",
                        "evaluate_rizz",
                        "generate_rizz_image",
                        "simulate_date",
                        "transcribe_audio",
                      ].includes(toolName),
                    })}
                  >
                    {toolName === "get_current_weather" ? (
                      <Weather />
                    ) : toolName === "evaluate_rizz" ? (
                      <RizzEvaluation
                        isLoading={true}
                        evaluationResult={{
                          score: 0,
                          feedback: "",
                          strengths: [],
                          improvements: [],
                          category: "",
                          emojis: [],
                        }}
                        userInput=""
                      />
                    ) : toolName === "generate_rizz_image" ? (
                      <RizzImage isLoading={true} imageUrl="" prompt="" />
                    ) : toolName === "simulate_date" ? (
                      <DateSimulation isLoading={true} />
                    ) : toolName === "transcribe_audio" ? (
                      <div className="bg-background/30 rounded-lg border border-border p-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {message.experimental_attachments && (
            <div className="flex flex-row gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cn(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
