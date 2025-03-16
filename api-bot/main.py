import base64
import requests
import io
from PIL import Image
from dotenv import load_dotenv
import os
import logging
import sys
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set in the .env file")

def resize_image(image_content, max_pixels=33177600):
    """
    Resize the image to ensure it has no more than max_pixels pixels while maintaining aspect ratio.
    Returns the resized image content as bytes.
    """
    try:
        # Validate image content is not empty
        if not image_content or len(image_content) == 0:
            raise ValueError("Image content is empty or invalid")

        # Open the image and validate format
        img_io = io.BytesIO(image_content)
        logger.debug(f"Initial img_io position: {img_io.tell()}, length: {len(image_content)} bytes")
        img = Image.open(img_io)
        logger.debug("Image opened successfully")
        img.verify()  # Verify image integrity
        img_io.seek(0)  # Reset pointer after verify
        img = Image.open(img_io).convert("RGB")  # Reopen and ensure image is in RGB format
        
        # Get original dimensions
        width, height = img.size
        total_pixels = width * height
        logger.info(f"Original image dimensions: {width}x{height} ({total_pixels} pixels)")
        
        # Check if resizing is needed
        if total_pixels <= max_pixels:
            logger.info(f"No resizing needed for image {width}x{height} ({total_pixels} pixels)")
            return image_content
        
        # Calculate initial scaling factor with a stricter approach
        scaling_factor = (max_pixels / total_pixels) ** 0.5
        new_width = int(width * scaling_factor)
        new_height = int(height * scaling_factor)
        
        # Ensure the new dimensions are strictly below max_pixels with aggressive reduction
        max_iterations = 15  # Increased to handle edge cases
        iteration = 0
        while new_width * new_height > max_pixels and iteration < max_iterations:
            scaling_factor *= 0.8  # Reduce by 20% iteratively for faster convergence
            new_width = int(width * scaling_factor)
            new_height = int(height * scaling_factor)
            iteration += 1
            logger.debug(f"Iteration {iteration}: Trying {new_width}x{new_height} ({new_width * new_height} pixels)")
            if new_width < 1 or new_height < 1:
                raise ValueError("Unable to resize image to acceptable dimensions")
        
        if new_width * new_height > max_pixels:
            raise ValueError(f"Failed to resize image below {max_pixels} pixels after {max_iterations} iterations")

        # Resize the image
        logger.debug(f"Resizing to {new_width}x{new_height}")
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert the resized image back to bytes
        output_buffer = io.BytesIO()
        img.save(output_buffer, format="JPEG", quality=85)  # Reduced quality to further minimize size
        resized_image_content = output_buffer.getvalue()
        
        # Verify resized image size
        img_io = io.BytesIO(resized_image_content)
        img_io.seek(0)
        img_resized = Image.open(img_io)
        resized_width, resized_height = img_resized.size
        resized_pixels = resized_width * resized_height
        logger.info(f"Resized image dimensions: {resized_width}x{resized_height} ({resized_pixels} pixels)")
        
        # Strictly enforce the pixel limit
        if resized_pixels > max_pixels:
            logger.error(f"Resized image still exceeds limit: {resized_pixels} pixels (max: {max_pixels})")
            raise ValueError(f"Resized image exceeds limit: {resized_pixels} pixels (max: {max_pixels})")
        
        logger.info(f"Successfully resized image from {width}x{height} ({total_pixels} pixels) to {resized_width}x{resized_height} ({resized_pixels} pixels)")
        return resized_image_content
    
    except ValueError as ve:
        logger.error(f"Validation error resizing image: {str(ve)}")
        return {"error": f"Validation error resizing image: {str(ve)}"}
    except Exception as e:
        logger.error(f"Error resizing image: {str(e)} with image content length: {len(image_content) if image_content else 0}")
        return {"error": f"Error resizing image: {str(e)}"}

def process_image(image_path, query):
    """
    Process the image from a file path and query it with Groq API models.
    Returns a dictionary with responses from both models.
    """
    try:
        with open(image_path, "rb") as image_file:
            image_content = image_file.read()
            logger.debug(f"Read {len(image_content)} bytes from {image_path}")
        
        # Validate image content
        if not image_content or len(image_content) == 0:
            raise ValueError(f"Image file {image_path} is empty or invalid")

        # Resize the image to meet API requirements
        image_content = resize_image(image_content)
        if isinstance(image_content, dict) and "error" in image_content:
            return image_content  # Return error if resizing failed

        # Encode the image
        encoded_image = base64.b64encode(image_content).decode("utf-8")

        # Verify image format after resizing
        try:
            img = Image.open(io.BytesIO(image_content))
            img.verify()
        except Exception as e:
            logger.error(f"Invalid image format after resizing: {str(e)}")
            return {"error": f"Invalid image format after resizing: {str(e)}"}
        
        # Prepare messages for the API with explicit instruction for object detection
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"Identify the prominent objects or features in this image that could be considered 'encoders' (e.g., objects that encode or convey information). Respond with a detailed description. Query: {query}"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}}
                ]
            }
        ]
        
        def make_api_request(model):
            try:
                response = requests.post(
                    GROQ_API_URL, 
                    json={
                        "model": model, 
                        "messages": messages, 
                        "max_tokens": 1500, 
                        "temperature": 0.7
                    },
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    timeout=30
                )
                response.raise_for_status()  # Raise an exception for bad status codes
                return response
            except requests.RequestException as e:
                logger.error(f"API request failed for {model}: {str(e)}")
                return None
        
        # Make requests to both models
        llama_11b_response = make_api_request("llama-3.2-11b-vision-preview")
        llama_90b_response = make_api_request("llama-3.2-90b-vision-preview")

        responses = {}
        for model, response in [("llama11b", llama_11b_response), ("llama90b", llama_90b_response)]:
            if response and response.status_code == 200:
                result = response.json()
                answer = result["choices"][0]["message"]["content"]
                logger.info(f"Processed response from {model} API: {answer[:100]}...")
                responses[model] = answer
            else:
                fallback_message = (
                    f"Failed to process image with {model}. Error: {response.text if response else 'No response'}"
                    if response and response.status_code != 200
                    else f"Failed to connect to {model} API. Please check your network or API key."
                )
                logger.error(fallback_message)
                responses[model] = fallback_message
        
        # Check if both models failed
        if all("Failed" in response for response in responses.values()):
            return {"error": "Both models failed to process the image."}

        return responses

    except FileNotFoundError:
        logger.error(f"Image file not found: {image_path}")
        return {"error": f"Image file not found: {image_path}"}
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        return {"error": f"An unexpected error occurred: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments. Usage: main.py <image_path> <query>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    query = sys.argv[2]
    result = process_image(image_path, query)
    print(json.dumps(result))