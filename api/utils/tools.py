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
    """Generate an image visualizing a flirting scenario or pickup line"""
    try:
        context = context or "casual conversation"
        
        # Enhance the prompt for better image quality
        enhanced_prompt = f"""Create a stylized artistic illustration for this flirting scenario: 
        
        {prompt}
        
        Context: {context}
        
        Style notes:
        - Modern, vibrant colors with artistic flair
        - No text overlays or words in the image
        - Focus on body language and emotional connection
        - Appropriate for a dating app profile
        - Non-photorealistic style preferred
        """
        
        # Try to generate with DALL-E 3 first
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=enhanced_prompt,
                n=1,
                size="1024x1024",
                timeout=30
            )
            image_url = response.data[0].url
            
            # Verify the image URL is valid
            if validate_image_url(image_url):
                return {
                    "url": image_url,
                    "prompt": prompt,
                    "context": context
                }
        except Exception as e:
            print(f"DALL-E 3 generation failed: {str(e)}")
        
        # If DALL-E 3 fails, try DALL-E 2
        try:
            response = client.images.generate(
                model="dall-e-2",
                prompt=enhanced_prompt,
                n=1,
                size="1024x1024",
                timeout=20
            )
            image_url = response.data[0].url
            
            # Verify the image URL is valid
            if validate_image_url(image_url):
                return {
                    "url": image_url,
                    "prompt": prompt,
                    "context": context
                }
        except Exception as e:
            print(f"DALL-E 2 generation failed: {str(e)}")
        
        # If all else fails, use a static fallback
        return {
            "url": get_fallback_image_url("flirt"),
            "prompt": prompt,
            "context": context,
            "note": "Used fallback image due to generation failure"
        }
        
    except Exception as e:
        print(f"Error in generate_rizz_image: {str(e)}")
        return {
            "url": get_fallback_image_url("flirt"),
            "prompt": prompt or "Unknown prompt",
            "context": context or "Unknown context",
            "error": str(e)
        }

def validate_image_url(url):
    """Validate if an image URL is accessible"""
    try:
        import requests
        from requests.exceptions import RequestException
        
        response = requests.head(url, timeout=5)
        return response.status_code == 200
    except RequestException:
        return False

def get_fallback_image_url(type="generic"):
    """Get a fallback image URL based on type"""
    fallback_images = {
        "flirt": [
            "https://placehold.co/1024x1024/e879f9/ffffff?text=Flirting+Scenario",
            "https://placehold.co/1024x1024/d946ef/ffffff?text=Dating+Scene"
        ],
        "date": [
            "https://placehold.co/1024x1024/9333ea/ffffff?text=Date+Conversation",
            "https://placehold.co/1024x1024/7e22ce/ffffff?text=Romance+Scene"
        ],
        "generic": [
            "https://placehold.co/1024x1024/6d28d9/ffffff?text=Image+Unavailable",
            "https://placehold.co/1024x1024/4c1d95/ffffff?text=Try+Again+Later"
        ]
    }
    
    import random
    image_list = fallback_images.get(type, fallback_images["generic"])
    return random.choice(image_list)

def evaluate_rizz(message, context="casual conversation"):
    """
    Evaluates a user's flirting/rizz skills and provides feedback
    
    Args:
        message (str): The flirting line or message to evaluate
        context (str): The context in which the line was used (e.g., "dating app", "bar", "casual conversation")
        
    Returns:
        dict: Evaluation results including score, feedback, and improvement tips
    """
    try:
        print(f"[DEBUG] Evaluating rizz for message: {message[:50]}... in context: {context}")
        
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
        
        # Ensure we have a valid result structure before returning
        result = {
            "score": overall_score,
            "context": context,
            "creativity": creativity_score,
            "confidence": confidence_score,
            "authenticity": authenticity_score,
            "feedback": feedback,
            "improvement_tips": improvement_tips,
            "category": category,
            "strengths": [], # Convert to proper format expected by frontend
            "improvements": improvement_tips,
            "emojis": ["💬", "🔥", "✨"]  # Add some emojis for UI display
        }
        
        print(f"[DEBUG] Evaluation complete. Score: {overall_score}/10")
        return result
        
    except Exception as e:
        print(f"[ERROR] Error in evaluate_rizz: {str(e)}")
        # Return a fallback response
        return {
            "score": 5,
            "context": context or "casual conversation",
            "feedback": "Sorry, I encountered an error while evaluating your message. Here's a generic response instead.",
            "strengths": ["Showing initiative by trying this tool"],
            "improvements": ["Try again with a different message"],
            "category": "medium",
            "emojis": ["🤔", "⚠️", "🔄"]
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
        voice (str): The voice to use (e.g., "alloy", "echo", "fable", "onyx", "nova", "shimmer")
        use_advanced_model (bool): Whether to use the advanced GPT-3.5-turbo audio models when possible
        
    Returns:
        dict: Audio data and metadata
    """
    try:
        if use_advanced_model:
            # Try using the advanced model
            try:
                # This model understands how to speak with the right emotion and tone
                response = client.chat.completions.create(
                    model=ensure_allowed_model("gpt-3.5-turbo"),
                    messages=[
                        {"role": "system", "content": "You are an AI that speaks with natural emotion and tone."},
                        {"role": "user", "content": text}
                    ],
                    temperature=0.7,
                    max_tokens=150
                )
                
                # Extract the content from the response for text-to-speech
                tts_text = response.choices[0].message.content
                
                # Generate speech with the processed text
                speech_response = client.audio.speech.create(
                    model="tts-1-hd",  # Using HD model for better quality
                    voice=voice,
                    input=tts_text
                )
                
            except Exception as e:
                print(f"Error using advanced TTS model, falling back to standard: {e}")
                speech_response = client.audio.speech.create(
                    model="tts-1",
                    voice=voice,
                    input=text
                )
        else:
            # Use standard TTS
            speech_response = client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=text
            )
        
        # Get audio data
        audio_data = speech_response.content
        
        # Convert to base64 for API response
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        
        return {
            "audio": audio_base64,
            "format": "mp3"
        }
    except Exception as e:
        print(f"Error generating speech: {e}")
        return {
            "error": str(e),
            "audio": None,
            "format": None
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
        
        # Use a better prompt for DALL-E 3 image generation
        image_prompt = f"""Create a stylized, artistic illustration of a romantic date conversation in a {context} setting.
Two people engaging in conversation with appropriate body language showing interest.
Vibrant colors, non-photorealistic style, modern aesthetic.
No text overlay. Focus on the emotional connection between the people."""

        # Setup multiple fallback image URLs
        placeholder_image_url = "https://placehold.co/1024x1024/9333ea/ffffff?text=Date+Simulation+Image+Loading"
        static_fallback_images = [
            "https://placehold.co/1024x1024/9333ea/ffffff?text=Date+Conversation",
            "https://placehold.co/1024x1024/7e22ce/ffffff?text=Romance+Scene",
            "https://placehold.co/1024x1024/6d28d9/ffffff?text=Dating+Simulation"
        ]
        
        # Set up image generation with a shorter timeout and better error handling
        image_url = None
        try:
            # Try DALL-E 3 first (best quality)
            image_response = client.images.generate(
                model="dall-e-3",
                prompt=image_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
                timeout=30,  # 30 second timeout
            )
            if hasattr(image_response, 'data') and len(image_response.data) > 0 and hasattr(image_response.data[0], 'url'):
                image_url = image_response.data[0].url
                print(f"Successfully generated DALL-E 3 image: {image_url[:60]}...")
        except Exception as img_error:
            print(f"DALL-E 3 image generation error: {str(img_error)}")
            
        # If DALL-E 3 failed, try DALL-E 2
        if not image_url:
            try:
                print("Falling back to DALL-E 2...")
                fallback_response = client.images.generate(
                    model="dall-e-2",
                    prompt=f"Artistic illustration of two people on a date in a {context}",
                    size="1024x1024",
                    quality="standard",
                    n=1,
                    timeout=20,  # 20 second timeout
                )
                if hasattr(fallback_response, 'data') and len(fallback_response.data) > 0 and hasattr(fallback_response.data[0], 'url'):
                    image_url = fallback_response.data[0].url
                    print(f"Successfully generated DALL-E 2 image: {image_url[:60]}...")
            except Exception as fallback_error:
                print(f"DALL-E 2 fallback image generation error: {str(fallback_error)}")
        
        # If all dynamic generation failed, use one of the static fallback images
        if not image_url:
            image_url = get_fallback_image_url("date")
            print(f"Using static fallback image: {image_url}")
        
        # Validate the image URL (perform a HEAD request to verify it's accessible)
        if not validate_image_url(image_url):
            image_url = get_fallback_image_url("date")
            print(f"Using fallback image after URL validation failure")
        
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
            "image_url": get_fallback_image_url("date"),
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
