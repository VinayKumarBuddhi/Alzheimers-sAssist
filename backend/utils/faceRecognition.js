const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate face embedding from image using Python script
 * @param {string} faceImage - Base64 encoded image or file path
 * @returns {Promise<Array<number>|null>} - Face embedding array or null if no face detected
 */
const generateFaceEmbedding = async (faceImage) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create temporary file for the image
      const tempDir = path.join(__dirname, '../temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const tempImagePath = path.join(tempDir, `face_${Date.now()}.jpg`);
      
      // If image is base64, save it to file
      if (faceImage.startsWith('data:image')) {
        const base64Data = faceImage.replace(/^data:image\/\w+;base64,/, '');
        await fs.writeFile(tempImagePath, base64Data, 'base64');
      } else {
        // Assume it's already a file path
        await fs.copyFile(faceImage, tempImagePath);
      }

      // Call Python script for face embedding generation
      const pythonProcess = spawn('python', [
        path.join(__dirname, '../python/generate_embedding.py'),
        tempImagePath
      ]);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        try {
          // Clean up temporary file
          await fs.unlink(tempImagePath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }

        if (code !== 0) {
          console.error('Python script error:', error);
          resolve(null);
          return;
        }

        try {
          const embedding = JSON.parse(result);
          resolve(embedding.face_embedding || null);
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          resolve(null);
        }
      });

      pythonProcess.on('error', async (err) => {
        try {
          await fs.unlink(tempImagePath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }
        console.error('Failed to start Python process:', err);
        resolve(null);
      });

    } catch (error) {
      console.error('Face embedding generation error:', error);
      resolve(null);
    }
  });
};

/**
 * Compare two face embeddings
 * @param {Array<number>} embedding1 - First face embedding
 * @param {Array<number>} embedding2 - Second face embedding
 * @param {number} tolerance - Matching tolerance (default: 0.6)
 * @returns {Promise<Object|null>} - Match result with score or null
 */
const compareFaces = async (embedding1, embedding2, tolerance = 0.6) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create temporary files for embeddings
      const tempDir = path.join(__dirname, '../temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const tempEmbedding1Path = path.join(tempDir, `embedding1_${Date.now()}.json`);
      const tempEmbedding2Path = path.join(tempDir, `embedding2_${Date.now()}.json`);

      // Save embeddings to temporary files
      await fs.writeFile(tempEmbedding1Path, JSON.stringify(embedding1));
      await fs.writeFile(tempEmbedding2Path, JSON.stringify(embedding2));

      // Call Python script for face comparison
      const pythonProcess = spawn('python', [
        path.join(__dirname, '../python/compare_faces.py'),
        tempEmbedding1Path,
        tempEmbedding2Path,
        tolerance.toString()
      ]);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        try {
          // Clean up temporary files
          await fs.unlink(tempEmbedding1Path);
          await fs.unlink(tempEmbedding2Path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp files:', cleanupError);
        }

        if (code !== 0) {
          console.error('Python script error:', error);
          resolve(null);
          return;
        }

        try {
          const comparison = JSON.parse(result);
          resolve(comparison);
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          resolve(null);
        }
      });

      pythonProcess.on('error', async (err) => {
        try {
          await fs.unlink(tempEmbedding1Path);
          await fs.unlink(tempEmbedding2Path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp files:', cleanupError);
        }
        console.error('Failed to start Python process:', err);
        resolve(null);
      });

    } catch (error) {
      console.error('Face comparison error:', error);
      resolve(null);
    }
  });
};

/**
 * Find best matching face from a list of embeddings
 * @param {Array<number>} targetEmbedding - Target face embedding
 * @param {Array<Array<number>>} candidateEmbeddings - List of candidate embeddings
 * @param {number} tolerance - Matching tolerance (default: 0.6)
 * @returns {Promise<Object|null>} - Best match with index and score or null
 */
const findBestMatch = async (targetEmbedding, candidateEmbeddings, tolerance = 0.6) => {
  let bestMatch = null;
  let bestScore = tolerance;

  for (let i = 0; i < candidateEmbeddings.length; i++) {
    const comparison = await compareFaces(targetEmbedding, candidateEmbeddings[i], tolerance);
    
    if (comparison && comparison.is_match && comparison.distance < bestScore) {
      bestMatch = {
        index: i,
        score: 1 - comparison.distance, // Convert distance to similarity score
        distance: comparison.distance
      };
      bestScore = comparison.distance;
    }
  }

  return bestMatch;
};

/**
 * Validate face embedding format
 * @param {Array<number>} embedding - Face embedding to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmbedding = (embedding) => {
  if (!Array.isArray(embedding)) return false;
  if (embedding.length !== 128) return false;
  return embedding.every(val => typeof val === 'number' && !isNaN(val));
};

module.exports = {
  generateFaceEmbedding,
  compareFaces,
  findBestMatch,
  validateEmbedding
}; 