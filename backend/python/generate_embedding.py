#!/usr/bin/env python3
"""
Face Embedding Generation Script
Generates 128-dimensional face embeddings from images using face_recognition library
"""

import sys
import json
import numpy as np
import face_recognition
from PIL import Image
import os

def generate_face_embedding(image_path):
    """
    Generate face embedding from image file
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: JSON response with face embedding or error message
    """
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            return {
                "success": False,
                "error": "Image file not found",
                "face_embedding": None
            }
        
        # Load image using face_recognition
        image = face_recognition.load_image_file(image_path)
        
        # Find face locations
        face_locations = face_recognition.face_locations(image)
        
        if not face_locations:
            return {
                "success": False,
                "error": "No face detected in the image",
                "face_embedding": None
            }
        
        # Generate face encodings
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        if not face_encodings:
            return {
                "success": False,
                "error": "Could not generate face encoding",
                "face_embedding": None
            }
        
        # Use the first face found (assuming single face per image)
        face_embedding = face_encodings[0].tolist()
        
        return {
            "success": True,
            "face_embedding": face_embedding,
            "face_count": len(face_locations),
            "message": "Face embedding generated successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "face_embedding": None
        }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python generate_embedding.py <image_path>",
            "face_embedding": None
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = generate_face_embedding(image_path)
    
    # Print result as JSON
    print(json.dumps(result))
    
    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main() 