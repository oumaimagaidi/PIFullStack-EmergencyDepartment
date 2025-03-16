from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
import requests
import io
from PIL import Image
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        # Open the image
        img = Image.open(io.BytesIO(image_content))
        
        # Get original dimensions
        width, height = img.size
        total_pixels = width * height
        
        # Check if resizing is needed
        if total_pixels <= max_pixels:
            # No resizing needed, return original content
            return image_content
        
        # Calculate scaling factor to reduce pixel count below max_pixels
        scaling_factor = (max_pixels / total_pixels) ** 0.5
        new_width = int(width * scaling_factor)
        new_height = int(height * scaling_factor)
        
        # Resize the image
        img = img.resize((new_width, new_height), Image.LANCZOS)
        
        # Convert the resized image back to bytes
        output_buffer = io.BytesIO()
        img.save(output_buffer, format="JPEG")
        resized_image_content = output_buffer.getvalue()
        
        logger.info(f"Resized image from {width}x{height} ({total_pixels} pixels) to {new_width}x{new_height} ({new_width * new_height} pixels)")
        return resized_image_content
    
    except Exception as e:
        logger.error(f"Error resizing image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error resizing image: {str(e)}")

def process_image(image_content, query):
    try:
        # Resize the image if necessary
        image_content = resize_image(image_content)
        
        # Encode the image
        encoded_image = base64.b64encode(image_content).decode("utf-8")

        # Verify image format
        try:
            img = Image.open(io.BytesIO(image_content))
            img.verify()
        except Exception as e:
            logger.error(f"Invalid image format: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

        # Prepare messages for the API
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": query},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}}
                ]
            }
        ]

        def make_api_request(model):
            response = requests.post(
                GROQ_API_URL,
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": 1000
                },
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=30
            )
            return response

        # Make requests to both models
        llama_11b_response = make_api_request("llama-3.2-11b-vision-preview")
        llama_90b_response = make_api_request("llama-3.2-90b-vision-preview")

        # Process responses
        responses = {}
        for model, response in [("llama11b", llama_11b_response), ("llama90b", llama_90b_response)]:
            if response.status_code == 200:
                result = response.json()
                answer = result["choices"][0]["message"]["content"]
                logger.info(f"Processed response from {model} API: {answer[:100]}...")
                responses[model] = answer
            else:
                logger.error(f"Error from {model} API: {response.status_code} - {response.text}")
                responses[model] = f"Error from {model} API: {response.status_code}"

        return responses

    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/upload_and_query")
async def upload_and_query(image: UploadFile = File(...), query: str = Form(...)):
    try:
        image_content = await image.read()
        if not image_content:
            raise HTTPException(status_code=400, detail="Empty file")

        result = process_image(image_content, query)
        return JSONResponse(status_code=200, content=result)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)