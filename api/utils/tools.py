import requests
import re
import random
import os
import json
import base64
from openai import OpenAI
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
import logging
from ..utils.prompt import ensure_allowed_model

load_dotenv(".env.local")

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

def get_current_weather(latitude, longitude):
    # Format the URL with proper parameter substitution
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto"

    try:
        # Make the API call
        response = requests.get(url)

        # Raise an exception for bad status codes
        response.raise_for_status()

        # Return the JSON response
        return response.json()

    except requests.RequestException as e:
        # Handle any errors that occur during the request
        print(f"Error fetching weather data: {e}")
        return None

def generate_rizz_image(prompt, context=None):
    """
    Generates an image visualizing the rizz situation or pickup line
    
    Args:
        prompt (str): The flirting scenario or pickup line to visualize
        context (str): The context of the situation (e.g., "dating app", "bar", "casual conversation")
        
    Returns:
        dict: Image URL and metadata
    """
    try:
        # If no context is provided, randomly select one
        if not context:
            import random
            
            # Create a diverse list of dating contexts
            contexts = [
                "coffee shop",
                "upscale restaurant",
                "casual bar",
                "art gallery opening",
                "bookstore",
                "park picnic",
                "beach sunset",
                "rooftop lounge",
                "museum",
                "hiking trail",
                "wine tasting",
                "cooking class",
                "farmers market",
                "concert venue",
                "botanical garden"
            ]
            
            # Select a random context
            context = random.choice(contexts)
            print(f"Randomly selected context for image: {context}")
            
        # Create a more detailed prompt for the image generation
        if context == "dating app":
            setting = "dating app conversation on a smartphone screen"
        elif context == "bar" or context == "casual bar":
            setting = "trendy bar or nightclub setting with low lighting"
        elif context == "coffee shop":
            setting = "cozy coffee shop with warm lighting and comfortable seating"
        elif context == "casual conversation" or context == "bookstore":
            setting = "bookstore with shelves of books in the background"
        elif context == "upscale restaurant":
            setting = "elegant restaurant with fine dining atmosphere"
        elif context == "art gallery opening":
            setting = "modern art gallery with paintings and sculptures"
        elif context == "park picnic":
            setting = "scenic park with trees and a picnic blanket"
        elif context == "beach sunset":
            setting = "beach at sunset with golden light and waves"
        elif context == "museum":
            setting = "museum with exhibits and displays in the background"
        elif context == "wine tasting":
            setting = "vineyard or wine bar with glasses of wine"
        elif "workplace" in context:
            setting = "professional office environment"
        else:
            setting = f"{context} setting with appropriate ambiance"
            
        # Create a more detailed prompt, avoiding explicit content
        enhanced_prompt = f"""
        A stylized illustration of a flirting scenario: "{prompt}". 
        Set in a {setting}.
        Use an artistic, non-photorealistic style with clean lines and abstract elements.
        Tasteful, appropriate for all audiences, no explicit content.
        Focus on body language, facial expressions, and the atmosphere rather than specific people.
        Use vibrant colors with pink and purple accents.
        """
        
        try:
            # First try with DALL-E 3
            response = client.images.generate(
                model="dall-e-3",
                prompt=enhanced_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            image_url = response.data[0].url
        except Exception as e:
            print(f"DALL-E 3 error: {e}, falling back to DALL-E 2")
            # Fall back to DALL-E 2 if DALL-E 3 fails
            response = client.images.generate(
                model="dall-e-2",
                prompt=enhanced_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            image_url = response.data[0].url
        
        # Return the image URL and related metadata
        return {
            "url": image_url,
            "context": context,
            "prompt": prompt
        }
    except Exception as e:
        print(f"Error generating rizz image: {e}")
        # Return a placeholder image on failure
        return {
            "url": "https://placehold.co/1024x1024/9333ea/ffffff?text=Rizz+Image+Generation+Failed",
            "context": context,
            "prompt": prompt,
            "error": str(e)
        }

def evaluate_rizz(message, context="casual conversation"):
    """
    Evaluates a user's flirting/rizz skills and provides feedback
    
    Args:
        message (str): The flirting line or message to evaluate
        context (str): The context in which the line was used (e.g., "dating app", "bar", "casual conversation")
        
    Returns:
        dict: Evaluation results including score, feedback, and improvement tips
    """
    # In a real app, you might call an LLM API here
    # For demo purposes, we'll use a more sophisticated evaluation logic
    
    # Clean the message
    cleaned_message = message.strip().lower()
    word_count = len(cleaned_message.split())
    
    # Detect if it contains common overused pickup lines
    common_lines = [
        "did it hurt when you fell from heaven",
        "are you a parking ticket",
        "did we have class together",
        "do you believe in love at first sight",
        "is your name google",
        "are you wifi",
        "if you were a vegetable",
        "are you from tennessee",
        "are you a magician",
        "is your dad a baker"
    ]
    
    is_generic = any(line in cleaned_message for line in common_lines)
    
    # Check for question vs. statement
    is_question = "?" in message
    
    # Check for humor
    humor_patterns = [
        r"joke",
        r"funny",
        r"laugh",
        r"haha",
        r"lol",
        r"pun",
        r"wordplay"
    ]
    has_humor = any(re.search(pattern, cleaned_message) for pattern in humor_patterns)
    
    # Check for compliments
    compliment_patterns = [
        r"beautiful",
        r"gorgeous",
        r"stunning",
        r"pretty",
        r"handsome",
        r"cute",
        r"lovely",
        r"smart",
        r"intelligent",
        r"clever",
        r"amazing",
        r"impressive"
    ]
    has_compliment = any(re.search(pattern, cleaned_message) for pattern in compliment_patterns)
    
    # Calculate base scores
    
    # Creativity score (1-10)
    creativity_score = 7
    if is_generic:
        creativity_score -= 4
    if word_count < 5:
        creativity_score -= 2
    if has_humor:
        creativity_score += 2
    
    creativity_score = min(max(creativity_score + random.randint(-1, 1), 1), 10)
    
    # Confidence score (1-10)
    confidence_score = 6
    if "sorry" in cleaned_message or "apologize" in cleaned_message:
        confidence_score -= 2
    if "maybe" in cleaned_message or "possibly" in cleaned_message or "perhaps" in cleaned_message:
        confidence_score -= 1
    if not is_question:
        confidence_score += 1
    if "!" in message:
        confidence_score += 1
    
    confidence_score = min(max(confidence_score + random.randint(-1, 1), 1), 10)
    
    # Authenticity score (1-10)
    authenticity_score = 5
    if is_generic:
        authenticity_score -= 3
    if word_count > 15:
        authenticity_score += 2  # More detailed messages tend to be more authentic
    if "feel" in cleaned_message or "think" in cleaned_message:
        authenticity_score += 1
    
    authenticity_score = min(max(authenticity_score + random.randint(-1, 1), 1), 10)
    
    # Overall score (weighted average)
    overall_score = int((creativity_score * 0.35) + (confidence_score * 0.3) + (authenticity_score * 0.35))
    
    # Generate feedback
    feedback_templates = {
        "low": [
            "Your rizz could use significant improvement. Focus on being more authentic and engaging.",
            "This approach may come across as too generic. Try something more personal and unique.",
            "This line seems forced and might not create the connection you're hoping for."
        ],
        "medium": [
            "You're on the right track, but need to refine your approach for better impact.",
            "There's potential in your style, but you could make it more engaging and authentic.",
            "Not bad, but with a few adjustments, you could greatly improve your rizz game."
        ],
        "high": [
            "Solid rizz! Your approach comes across as confident and authentic.",
            "Great job! This approach balances confidence and authenticity in a compelling way.",
            "Very impressive! Your rizz game shows creativity while maintaining authenticity."
        ]
    }
    
    # Select feedback based on score
    if overall_score <= 4:
        feedback = random.choice(feedback_templates["low"])
        category = "low"
    elif overall_score <= 7:
        feedback = random.choice(feedback_templates["medium"])
        category = "medium"
    else:
        feedback = random.choice(feedback_templates["high"])
        category = "high"
    
    # Generate improvement tips based on lowest scores
    improvement_tips = []
    
    lowest_score = min(creativity_score, confidence_score, authenticity_score)
    
    if creativity_score == lowest_score:
        creativity_tips = [
            "Try using more original language rather than common pickup lines",
            "Incorporate a specific observation or shared interest to make it personal",
            "Use clever wordplay or subtle humor to stand out",
            "Reference something unique about the context or situation"
        ]
        improvement_tips.append(random.choice(creativity_tips))
    
    if confidence_score == lowest_score:
        confidence_tips = [
            "Use more direct and assertive language",
            "Avoid undermining phrases like 'maybe' or 'sorry'",
            "Keep your message concise and to the point",
            "Ask open-ended questions that invite engaging responses"
        ]
        improvement_tips.append(random.choice(confidence_tips))
    
    if authenticity_score == lowest_score:
        authenticity_tips = [
            "Share something genuine about yourself or your interests",
            "Avoid overused lines that don't reflect your personality",
            "Be more specific and personal in your approach",
            "Express genuine curiosity about the other person"
        ]
        improvement_tips.append(random.choice(authenticity_tips))
    
    # Add context-specific tips
    if context == "dating app":
        improvement_tips.append("Reference something specific from their profile to show you've paid attention")
    elif context == "bar" or context == "club":
        improvement_tips.append("Keep it light and fun for the environment, but be respectful of personal space")
    elif context == "casual conversation":
        improvement_tips.append("Build on shared experiences or observations to create natural conversation flow")
    
    # Add one general tip based on overall category
    general_tips = {
        "low": [
            "Focus on asking questions that show genuine interest",
            "Try to be more specific and less generic in your approach",
            "Consider how your message might be received from their perspective"
        ],
        "medium": [
            "Balance confidence with respect and authenticity",
            "Try to incorporate more of your genuine personality",
            "Consider timing and context when delivering your message"
        ],
        "high": [
            "Continue being yourself while refining your technique",
            "Consider how to adapt your style to different situations",
            "Remember that different people respond to different approaches"
        ]
    }
    
    improvement_tips.append(random.choice(general_tips[category]))
    
    # Make sure we don't have duplicate tips
    improvement_tips = list(set(improvement_tips))
    
    return {
        "score": overall_score,
        "context": context,
        "creativity": creativity_score,
        "confidence": confidence_score,
        "authenticity": authenticity_score,
        "feedback": feedback,
        "improvement_tips": improvement_tips
    }

def transcribe_audio(audio_url):
    """
    Transcribes spoken audio to text using OpenAI's Whisper model
    
    Args:
        audio_url (str): URL to the audio file
        
    Returns:
        dict: Transcription text and metadata
    """
    try:
        # Download the audio file
        audio_response = requests.get(audio_url)
        audio_response.raise_for_status()
        
        # Save to a temporary file
        temp_file = "temp_audio.mp3"
        with open(temp_file, "wb") as f:
            f.write(audio_response.content)
        
        # Transcribe the audio file
        with open(temp_file, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        
        # Clean up
        os.remove(temp_file)
        
        return {
            "text": transcription.text,
            "success": True
        }
        
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return {
            "text": "",
            "success": False,
            "error": str(e)
        }

def generate_speech(text, voice="alloy", use_advanced_model=False):
    """
    Generates speech from text using OpenAI's Text-to-Speech API
    
    Args:
        text (str): The text to convert to speech
        voice (str): The voice to use (options: alloy, echo, fable, onyx, nova, shimmer)
        use_advanced_model (bool): Whether to use the advanced GPT-3.5-turbo audio models when possible
        
    Returns:
        dict: Audio data and metadata
    """
    try:
        if len(text) > 4000:
            # OpenAI TTS has a 4096 character limit
            text = text[:4000] + "..."
        
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        if use_advanced_model:
            try:
                # Try using the advanced GPT-3.5-turbo TTS model
                # This model understands how to speak with the right emotion and tone
                response = client.chat.completions.create(
                    model=ensure_allowed_model("gpt-3.5-turbo"),
                    modalities=["text", "audio"],
                    audio={"voice": voice, "format": "mp3"},
                    messages=[
                        {
                            "role": "user",
                            "content": f"Speak the following text naturally: {text}"
                        }
                    ]
                )
                
                # Extract audio data directly from response
                audio_base64 = response.choices[0].message.audio.data
                
                return {
                    "audio_base64": audio_base64,
                    "text": text,
                    "voice": voice,
                    "model": "gpt-3.5-turbo"
                }
            except Exception as e:
                # If there's an error with the advanced model, fall back to the standard model
                print(f"Error using advanced TTS model, falling back to standard: {e}")
                pass
                
        # Standard TTS model
        response = client.audio.speech.create(
            model="tts-1-hd",  # Using HD model for better quality
            voice=voice,
            input=text,
        )
        
        # Save to a temporary file
        temp_file = f"temp/speech_{random.randint(10000, 99999)}.mp3"
        response.stream_to_file(temp_file)
        
        # Convert the audio file to base64
        with open(temp_file, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
        
        # Clean up
        os.remove(temp_file)
        
        return {
            "audio_base64": audio_base64,
            "text": text,
            "voice": voice,
            "model": "tts-1-hd"
        }
        
    except Exception as e:
        print(f"Error generating speech: {e}")
        return {
            "error": str(e),
            "text": text,
            "voice": voice
        }

def simulate_date(message, context=None):
    """
    Simulates a date scenario based on the user's input and evaluates how it would go
    
    Args:
        message (str): The user's approach or conversation starter
        context (str): The dating context (e.g., "restaurant", "coffee shop", "park")
        
    Returns:
        dict: Date simulation results with scenario, response, outcome and score
    """
    try:
        # If no context is provided, randomly select one
        if not context:
            import random
            
            # Create a diverse list of dating contexts
            contexts = [
                "coffee shop",
                "upscale restaurant",
                "casual bar",
                "art gallery opening",
                "bookstore",
                "park picnic",
                "beach sunset",
                "rooftop lounge",
                "museum tour",
                "hiking trail",
                "wine tasting",
                "cooking class",
                "farmers market",
                "concert venue",
                "botanical garden",
                "ice cream parlor",
                "arcade",
                "bowling alley",
                "jazz club",
                "food truck festival"
            ]
            
            # Select a random context
            context = random.choice(contexts)
            print(f"Randomly selected context: {context}")
        
        # Create a system prompt for the date simulation
        system_prompt = f"""
        You are a dating coach AI that simulates realistic dating scenarios. 
        Based on the user's conversation starter or approach in a {context} setting, 
        create a detailed simulation of how the date would unfold.
        
        Create the simulation as a dialogue between the user and their date.
        Format as:
        
        Date Setting: [Brief description of the {context} setting with specific details]
        
        You: [User's opening line]
        Date: [Date's response]
        You: [Next thing user might say]
        Date: [Date's response]
        
        Continue the conversation for 3-4 exchanges, then provide:
        1. Overall assessment of how the date went on a scale of 1-10
        2. Specific feedback on what worked well
        3. Suggestions for improvement
        """
        
        # Call the OpenAI API with GPT-3.5-turbo
        response = client.chat.completions.create(
            model=ensure_allowed_model("gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=800,
        )
        
        # Parse the response to extract the date simulation components
        simulation_text = response.choices[0].message.content
        
        # Generate a placeholder image first to avoid waiting
        placeholder_image_url = "https://placehold.co/1024x1024/9333ea/ffffff?text=Date+Simulation+Image+Loading"
        
        # Use a better prompt for DALL-E 3 image generation
        image_prompt = f"""Create a stylized, artistic illustration of a romantic date conversation in a {context} setting.
Two people engaging in conversation with appropriate body language showing interest.
Vibrant colors, non-photorealistic style, modern aesthetic.
No text overlay. Focus on the emotional connection between the people."""
        
        # Set up image generation with a shorter timeout
        try:
            image_response = client.images.generate(
                model="dall-e-3", # Use DALL-E 3 for better quality
                prompt=image_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            image_url = image_response.data[0].url
        except Exception as img_error:
            print(f"Image generation error: {img_error}")
            # Try fallback to DALL-E 2 if DALL-E 3 fails
            try:
                fallback_response = client.images.generate(
                    model="dall-e-2",
                    prompt=f"Artistic illustration of two people on a date in a {context}",
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )
                image_url = fallback_response.data[0].url
            except:
                # Use placeholder if all attempts fail
                image_url = placeholder_image_url
        
        # Extract the date's responses from the simulation text for text-to-speech
        date_responses = []
        for line in simulation_text.split('\n'):
            if line.startswith('Date:'):
                date_response = line.replace('Date:', '').strip()
                date_responses.append(date_response)
        
        # Generate speech for the date's responses
        date_speech = None
        if date_responses:
            # Join with a pause between responses
            combined_responses = " ... ".join(date_responses)
            
            # Use the advanced TTS model for more natural and emotional delivery
            description = ""
            if "flirty" in context.lower() or "bar" in context.lower():
                description = "Speak this in a flirtatious, warm manner"
            elif "restaurant" in context.lower() or "fancy" in context.lower():
                description = "Speak this in a sophisticated, elegant manner"
            elif "coffee" in context.lower() or "casual" in context.lower():
                description = "Speak this in a casual, friendly manner"
            
            # Use more natural, emotional speech for the date
            date_speech = generate_speech(
                combined_responses, 
                voice="nova", 
                use_advanced_model=True
            )
        
        # Use a second API call to analyze and score the date
        analysis_prompt = f"""
        Based on this date scenario:
        
        {simulation_text}
        
        Provide a structured evaluation with the following:
        1. Overall score (1-10)
        2. Chemistry score (1-10) 
        3. Conversation flow score (1-10)
        4. Key strengths (3 bullet points)
        5. Areas for improvement (3 bullet points)
        
        Format as a JSON object with keys: overall_score, chemistry_score, conversation_score, strengths, improvements
        """
        
        analysis_response = client.chat.completions.create(
            model=ensure_allowed_model("gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": "You are a dating coach AI. Respond only with the requested JSON format."},
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        
        try:
            # Parse the JSON response
            analysis = json.loads(analysis_response.choices[0].message.content)
        except:
            # Fallback if JSON parsing fails
            analysis = {
                "overall_score": 7,
                "chemistry_score": 6,
                "conversation_score": 7,
                "strengths": [
                    "Good opening approach",
                    "Maintained positive tone",
                    "Showed genuine interest"
                ],
                "improvements": [
                    "Could ask more open-ended questions",
                    "Be more specific with compliments",
                    "Add more humor to lighten the mood"
                ]
            }
        
        # Return the complete simulation results
        return {
            "scenario": simulation_text,
            "image_url": image_url,
            "context": context,
            "analysis": analysis,
            "date_speech": date_speech
        }
        
    except Exception as e:
        print(f"Error simulating date: {e}")
        return {
            "scenario": "There was an error simulating the date scenario.",
            "image_url": "https://placehold.co/600x400/9333ea/ffffff?text=Date+Simulation+Failed",
            "context": context,
            "analysis": {
                "overall_score": 5,
                "chemistry_score": 5,
                "conversation_score": 5,
                "strengths": ["Unable to analyze strengths"],
                "improvements": ["Unable to provide improvements"]
            },
            "error": str(e)
        }
