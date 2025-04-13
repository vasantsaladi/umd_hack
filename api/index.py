import os
import json
from typing import List
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, Query, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from .utils.prompt import ClientMessage, convert_to_openai_messages, ensure_allowed_model
from .utils.tools import get_current_weather, evaluate_rizz, generate_rizz_image, transcribe_audio, simulate_date, generate_speech


load_dotenv(".env.local")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)


class Request(BaseModel):
    messages: List[ClientMessage]


available_tools = {
    "get_current_weather": get_current_weather,
    "evaluate_rizz": evaluate_rizz,
    "generate_rizz_image": generate_rizz_image,
    "transcribe_audio": transcribe_audio,
    "simulate_date": simulate_date,
}

# Shared tool definitions to avoid duplication
tool_definitions = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather at a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude": {
                        "type": "number",
                        "description": "The latitude of the location",
                    },
                    "longitude": {
                        "type": "number",
                        "description": "The longitude of the location",
                    },
                },
                "required": ["latitude", "longitude"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "evaluate_rizz",
            "description": "Evaluate a flirting line or message and provide feedback on rizz skills",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "The flirting line or message to evaluate",
                    },
                    "context": {
                        "type": "string",
                        "description": "The context in which the line was used (e.g., 'dating app', 'bar', 'casual conversation')",
                    },
                },
                "required": ["message"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_rizz_image",
            "description": "Generate an image visualizing a flirting scenario or pickup line",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The flirting scenario or pickup line to visualize",
                    },
                    "context": {
                        "type": "string",
                        "description": "The context of the situation (e.g., 'dating app', 'bar', 'casual conversation')",
                    },
                },
                "required": ["prompt"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "transcribe_audio",
            "description": "Transcribe spoken audio to text",
            "parameters": {
                "type": "object",
                "properties": {
                    "audio_url": {
                        "type": "string",
                        "description": "URL to the audio file",
                    },
                },
                "required": ["audio_url"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "simulate_date",
            "description": "Simulates a date scenario based on the user's approach or conversation starter",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "The user's approach or conversation starter",
                    },
                    "context": {
                        "type": "string",
                        "description": "The dating context (e.g., 'restaurant', 'coffee shop', 'park')",
                    },
                },
                "required": ["message"],
            },
        },
    }
]

def do_stream(messages: List[ChatCompletionMessageParam]):
    stream = client.chat.completions.create(
        messages=messages,
        model=ensure_allowed_model("gpt-3.5-turbo"),
        max_tokens=500,
        stream=True,
        tools=tool_definitions
    )

    return stream

def stream_text(messages: List[ChatCompletionMessageParam], protocol: str = 'data'):
    draft_tool_calls = []
    draft_tool_calls_index = -1

    try:
        print(f"[DEBUG] Creating OpenAI stream with {len(messages)} messages")
        
        # Log the OpenAI API key length (without revealing the actual key)
        api_key = os.environ.get("OPENAI_API_KEY", "")
        print(f"[DEBUG] Using OpenAI API key of length: {len(api_key)}")
        print(f"[DEBUG] API key starts with: {api_key[:4]}...")
        
        stream = client.chat.completions.create(
            messages=messages,
            model=ensure_allowed_model("gpt-3.5-turbo"),
            max_tokens=300,  # Further limit token output
            stream=True,
            tools=tool_definitions
        )
        
        print("[DEBUG] Stream created successfully")

        for chunk in stream:
            # Debug chunk info
            if hasattr(chunk, 'id'):
                print(f"[DEBUG] Processing chunk: {chunk.id[:8]}...")
                
            for choice in chunk.choices:
                if choice.finish_reason == "stop":
                    continue

                elif choice.finish_reason == "tool_calls":
                    for tool_call in draft_tool_calls:
                        yield '9:{{"toolCallId":"{id}","toolName":"{name}","args":{args}}}\n'.format(
                            id=tool_call["id"],
                            name=tool_call["name"],
                            args=tool_call["arguments"])

                    for tool_call in draft_tool_calls:
                        try:
                            # Safely execute the tool call with error handling
                            if tool_call["name"] in available_tools:
                                tool_result = available_tools[tool_call["name"]](
                                    **json.loads(tool_call["arguments"]))
                            else:
                                tool_result = {"error": f"Tool {tool_call['name']} not found"}
                            
                            yield 'a:{{"toolCallId":"{id}","toolName":"{name}","args":{args},"result":{result}}}\n'.format(
                                id=tool_call["id"],
                                name=tool_call["name"],
                                args=tool_call["arguments"],
                                result=json.dumps(tool_result))
                        except Exception as e:
                            # Return error as the tool result
                            yield 'a:{{"toolCallId":"{id}","toolName":"{name}","args":{args},"result":{{"error":"{error}"}}}}\n'.format(
                                id=tool_call["id"],
                                name=tool_call["name"],
                                args=tool_call["arguments"],
                                error=str(e).replace('"', '\\"'))

                elif choice.delta.tool_calls:
                    for tool_call in choice.delta.tool_calls:
                        id = tool_call.id
                        name = tool_call.function.name
                        arguments = tool_call.function.arguments

                        if (id is not None):
                            draft_tool_calls_index += 1
                            draft_tool_calls.append(
                                {"id": id, "name": name, "arguments": ""})

                        else:
                            draft_tool_calls[draft_tool_calls_index]["arguments"] += arguments

                else:
                    yield '0:{text}\n'.format(text=json.dumps(choice.delta.content))

            if chunk.choices == []:
                usage = chunk.usage
                prompt_tokens = usage.prompt_tokens
                completion_tokens = usage.completion_tokens

                yield 'e:{{"finishReason":"{reason}","usage":{{"promptTokens":{prompt},"completionTokens":{completion}}},"isContinued":false}}\n'.format(
                    reason="tool-calls" if len(
                        draft_tool_calls) > 0 else "stop",
                    prompt=prompt_tokens,
                    completion=completion_tokens
                )
    except Exception as e:
        # Handle any exceptions in the streaming process
        error_message = str(e)
        if "context_length_exceeded" in error_message or "maximum context length" in error_message:
            yield 'e:{{"finishReason":"context-length-exceeded","error":"Message context too long, please start a new chat"}}\n'
        else:
            yield 'e:{{"finishReason":"error","error":"{0}"}}\n'.format(error_message.replace('"', '\\"'))


@app.post("/api/chat")
async def handle_chat_data(request: Request, protocol: str = Query('data')):
    """
    Handles chat messages from the client and processes tool invocations
    """
    try:
        print(f"[DEBUG] Received chat request with protocol: {protocol}")
        
        # Convert client messages to OpenAI format
        messages = convert_to_openai_messages(request.messages)
        
        print(f"[DEBUG] Processing {len(messages)} messages")
        
        # Log the last message for debugging
        if messages and len(messages) > 0:
            last_message = messages[-1]
            if isinstance(last_message, dict) and 'content' in last_message:
                print(f"[DEBUG] Last message content: {last_message['content'][:100]}...")
        
        # Stream the response back to the client
        return StreamingResponse(
            stream_text(messages, protocol),
            media_type="text/event-stream"
        )
    except Exception as e:
        print(f"[ERROR] Error in /api/chat endpoint: {str(e)}")
        # Return a proper error response instead of raising an exception
        return {"error": str(e)}


@app.post("/api/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    # Create temp directory if it doesn't exist
    os.makedirs("temp", exist_ok=True)
    
    # Save the uploaded file
    file_path = f"temp/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Transcribe the audio
    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    
    # Clean up
    os.remove(file_path)
    
    return {"text": transcription.text}

class TextToSpeechRequest(BaseModel):
    text: str
    voice: str = "alloy"
    use_advanced_model: bool = False  # Whether to use the advanced GPT-3.5 audio models

@app.post("/api/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """Generate speech from text using OpenAI's Text-to-Speech API"""
    result = generate_speech(
        text=request.text, 
        voice=request.voice,
        use_advanced_model=request.use_advanced_model
    )
    return result
