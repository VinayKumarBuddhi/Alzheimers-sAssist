#!/usr/bin/env python3
"""
Face Comparison Script
Compares two face embeddings and determines if they match
"""

import sys
import json
import numpy as np
import face_recognition
import os

def compare_face_embeddings(embedding1_path, embedding2_path, tolerance=0.5):
    """
    Compare two face embeddings and determine if they match
    
    Args:
        embedding1_path (str): Path to first embedding JSON file
        embedding2_path (str): Path to second embedding JSON file
        tolerance (float): Matching tolerance (default: 0.5)
        
    Returns:
        dict: JSON response with comparison result
    """
    try:
        # Check if files exist
        if not os.path.exists(embedding1_path):
            return {
                "success": False,
                "error": "First embedding file not found",
                "is_match": False,
                "distance": None
            }
        
        if not os.path.exists(embedding2_path):
            return {
                "success": False,
                "error": "Second embedding file not found",
                "is_match": False,
                "distance": None
            }
        
        # Load embeddings from JSON files
        with open(embedding1_path, 'r') as f:
            embedding1_data = json.load(f)
            embedding1 = np.array(embedding1_data)
        
        with open(embedding2_path, 'r') as f:
            embedding2_data = json.load(f)
            embedding2 = np.array(embedding2_data)
        
        # Validate embeddings
        if len(embedding1) != 128 or len(embedding2) != 128:
            return {
                "success": False,
                "error": "Invalid embedding dimensions",
                "is_match": False,
                "distance": None
            }
        
        # Calculate face distance using face_recognition
        distance = face_recognition.face_distance([embedding1], embedding2)[0]
        
        # Determine if faces match based on tolerance
        is_match = distance < tolerance
        
        return {
            "success": True,
            "is_match": bool(is_match),
            "distance": float(distance),
            "tolerance": float(tolerance),
            "similarity_score": float(1 - distance),
            "message": "Face comparison completed successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "is_match": False,
            "distance": None
        }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 3 or len(sys.argv) > 4:
        print(json.dumps({
            "success": False,
            "error": "Usage: python compare_faces.py <embedding1_path> <embedding2_path> [tolerance]",
            "is_match": False,
            "distance": None
        }))
        sys.exit(1)
    
    embedding1_path = sys.argv[1]
    embedding2_path = sys.argv[2]
    tolerance = float(sys.argv[3]) if len(sys.argv) == 4 else 0.5
    
    result = compare_face_embeddings(embedding1_path, embedding2_path, tolerance)
    
    # Print result as JSON
    print(json.dumps(result))
    
    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main() 