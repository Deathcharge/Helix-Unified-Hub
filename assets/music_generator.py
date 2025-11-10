import os
import scipy.io.wavfile
import torch
from transformers import pipeline
import random
import traceback
from fastapi import HTTPException
from pydantic import BaseModel

# --- Configuration ---
# The model is large, so we load it once and reuse it.
# We will use the smaller musicgen-small for faster generation in the sandbox.
# In a real deployment, the model would be loaded outside the request handler.
MODEL_NAME = "facebook/musicgen-small"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Global variable to hold the loaded pipeline
music_synthesiser = None

def load_music_synthesiser():
    """Loads the MusicGen pipeline once."""
    global music_synthesiser
    if music_synthesiser is None:
        try:
            print(f"Loading MusicGen model on device: {DEVICE}")
            # Use device=0 for CUDA, or -1 for CPU
            device_id = 0 if DEVICE.type == 'cuda' else -1
            music_synthesiser = pipeline(
                "text-to-audio", 
                model=MODEL_NAME, 
                device=device_id
            )
            print("MusicGen model loaded successfully.")
        except Exception as e:
            print(f"Failed to load MusicGen model: {e}")
            music_synthesiser = False # Mark as failed to prevent re-attempting
    return music_synthesiser

class MusicRequest(BaseModel):
    """Schema for the music generation request."""
    prompt: str
    duration: int = 10 # Default to 10 seconds
    tracks: int = 1 # Default to 1 track

class MusicResponse(BaseModel):
    """Schema for the music generation response."""
    status: str
    message: str
    output_files: list[str]

def generate_music_track(prompt: str, duration: int) -> tuple[int, list[int]]:
    """Generates a single audio track."""
    if music_synthesiser is False:
        raise RuntimeError("MusicGen model failed to load.")
    
    # Generate audio
    # max_length is roughly duration * 50 for MusicGen
    music = music_synthesiser(
        prompt, 
        forward_params={"do_sample": True, "max_length": duration * 50}
    )
    
    return music["sampling_rate"], music["audio"]

def generate_music_service(request: MusicRequest) -> MusicResponse:
    """The main service function to generate music."""
    if request.duration <= 0 or request.duration > 30:
        raise HTTPException(status_code=400, detail="Duration must be between 1 and 30 seconds.")
    if request.tracks <= 0 or request.tracks > 2:
        raise HTTPException(status_code=400, detail="Tracks must be 1 or 2.")

    synthesiser = load_music_synthesiser()
    if not synthesiser:
        raise HTTPException(status_code=503, detail="Music Generation service is unavailable. Model failed to load.")

    output_files = []
    try:
        for i in range(request.tracks):
            # Use a random seed for variety
            random_seed = random.randint(0, 2**32 - 1)
            torch.manual_seed(random_seed)
            if DEVICE.type == 'cuda':
                torch.cuda.manual_seed_all(random_seed)

            sampling_rate, audio_data = generate_music_track(request.prompt, request.duration)
            
            # Save audio file to a temporary location
            output_filename = f"music_track_{i+1}_{random_seed}.wav"
            output_path = os.path.join("/tmp", output_filename)
            scipy.io.wavfile.write(output_path, rate=sampling_rate, data=audio_data)
            output_files.append(output_path)

        return MusicResponse(
            status="success",
            message=f"Successfully generated {len(output_files)} music track(s).",
            output_files=output_files
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during music generation: {e}")
    
    finally:
        # Clean up resources (important for GPU memory)
        if DEVICE.type == 'cuda':
            torch.cuda.empty_cache()

# Load the model immediately upon import
load_music_synthesiser()

if __name__ == '__main__':
    # Example usage (for local testing)
    test_request = MusicRequest(
        prompt="a serene, ambient electronic track with a slow tempo and deep bass",
        duration=10,
        tracks=1
    )
    try:
        response = generate_music_service(test_request)
        print(response.json())
    except HTTPException as e:
        print(f"HTTP Error: {e.detail}")
    except Exception as e:
        print(f"General Error: {e}")
