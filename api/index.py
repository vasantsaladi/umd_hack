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
from .utils.prompt import ClientMessage, convert_to_openai_messages
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

def do_stream(messages: List[ChatCompletionMessageParam]):
    stream = client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
        stream=True,
        tools=[{
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
        }]
    )

    return stream

def stream_text(messages: List[ChatCompletionMessageParam], protocol: str = 'data'):
    draft_tool_calls = []
    draft_tool_calls_index = -1

    stream = client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
        stream=True,
        tools=[{
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
        }]
    )

    for chunk in stream:
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
                    tool_result = available_tools[tool_call["name"]](
                        **json.loads(tool_call["arguments"]))

                    yield 'a:{{"toolCallId":"{id}","toolName":"{name}","args":{args},"result":{result}}}\n'.format(
                        id=tool_call["id"],
                        name=tool_call["name"],
                        args=tool_call["arguments"],
                        result=json.dumps(tool_result))

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


@app.post("/api/chat")
async def handle_chat_data(request: Request, protocol: str = Query('data')):
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)

    response = StreamingResponse(stream_text(openai_messages, protocol))
    response.headers['x-vercel-ai-data-stream'] = 'v1'
    return response


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
    voice: str = "nova"  # Default voice
    use_advanced_model: bool = False  # Whether to use the advanced GPT-4o audio models

@app.post("/api/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """Generate speech from text using OpenAI's Text-to-Speech API"""
    result = generate_speech(
        text=request.text, 
        voice=request.voice,
        use_advanced_model=request.use_advanced_model
    )
    return result
