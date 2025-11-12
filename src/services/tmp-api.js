import axios from 'axios';

// API Configuration - using Vite proxy for development, Vercel functions for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Vercel serverless functions
  : '/api';  // Vite dev server proxy

// Get API key from localStorage first, then fallback to environment variables
// Update getApiKey to avoid using process.env in browser and prefer localStorage / import.meta.env
const getApiKey = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const k = window.localStorage.getItem('modelark_api_key');
      if (k) return k;
    }
  } catch {}
  const env = (typeof import.meta !== 'undefined' && (import.meta).env) ? (import.meta).env : {};
  const fromVite = env?.VITE_ARK_API_KEY || env?.REACT_APP_ARK_API_KEY;
  if (fromVite) return fromVite;
  return null;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to set Authorization header dynamically
apiClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  console.log('Using API key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'undefined');
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

// Seedream 4.0 Image Generation API
export class SeedreamAPI {
  static async generateSingleImage(prompt, options = {}) {
    const payload = {
      model: "seedream-4-0-250828",
      prompt,
      sequential_image_generation: "disabled",
      response_format: "url",
      size: options.size || "2K",
      stream: false,
      watermark: options.watermark !== false,
      ...options
    };

    try {
      const response = await apiClient.post('/images/generations', payload);
      return response.data;
    } catch (error) {
      console.error('Error generating single image:', error);
      throw error;
    }
  }

  static async generateMultipleImages(prompt, maxImages = 4, options = {}) {
    const payload = {
      model: "seedream-4-0-250828",
      prompt,
      sequential_image_generation: "auto",
      sequential_image_generation_options: {
        max_images: maxImages
      },
      response_format: "url",
      size: options.size || "2K",
      stream: true,
      watermark: options.watermark !== false,
      ...options
    };

    try {
      // Use fetch for streaming response instead of axios
      const auth = getApiKey();
      const headers = {
        'Content-Type': 'application/json',
        ...(auth ? { 'Authorization': `Bearer ${auth}` } : {}),
      };
      const response = await fetch(`${API_BASE_URL}/images/generations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const images = [];
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6); // Remove 'data: ' prefix
              
              if (dataStr === '[DONE]') {
                break;
              }
              
              try {
                const data = JSON.parse(dataStr);
                
                if (data.type === 'image_generation.partial_succeeded' && data.url) {
                  images.push({
                    url: data.url,
                    size: data.size,
                    image_index: data.image_index
                  });
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', dataStr);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return { data: images };
    } catch (error) {
      console.error('Error generating multiple images:', error);
      throw error;
    }
  }

  static async editImage(prompt, imageUrl, options = {}) {
    const payload = {
      model: "seedream-4-0-250828",
      prompt,
      image: imageUrl,
      sequential_image_generation: "disabled",
      response_format: "url",
      size: options.size || "2K",
      stream: false,
      watermark: options.watermark !== false,
      ...options
    };

    try {
      const response = await apiClient.post('/images/generations', payload);
      return response.data;
    } catch (error) {
      console.error('Error editing image:', error);
      throw error;
    }
  }

  static async expandImageToMultiples(prompt, imageUrl, maxImages = 5, options = {}) {
    const payload = {
      model: "seedream-4-0-250828",
      prompt,
      image: imageUrl,
      sequential_image_generation: "auto",
      sequential_image_generation_options: {
        max_images: maxImages
      },
      response_format: "url",
      size: options.size || "2K",
      stream: true,
      watermark: options.watermark !== false,
      ...options
    };

    try {
      // Use fetch for streaming response instead of axios
      const auth = getApiKey();
      const headers = {
        'Content-Type': 'application/json',
        ...(auth ? { 'Authorization': `Bearer ${auth}` } : {}),
      };
      const response = await fetch(`${API_BASE_URL}/images/generations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const images = [];
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6); // Remove 'data: ' prefix
              
              if (dataStr === '[DONE]') {
                break;
              }
              
              try {
                const data = JSON.parse(dataStr);
                
                if (data.type === 'image_generation.partial_succeeded' && data.url) {
                  images.push({
                    url: data.url,
                    size: data.size,
                    image_index: data.image_index
                  });
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', dataStr);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return { data: images };
    } catch (error) {
      console.error('Error expanding image to multiples:', error);
      throw error;
    }
  }

  static async generateWithReferenceImages(prompt, imageUrls, options = {}) {
    const payload = {
      model: "seedream-4-0-250828",
      prompt,
      image: imageUrls,
      sequential_image_generation: "disabled",
      response_format: "url",
      size: options.size || "2K",
      stream: false,
      watermark: options.watermark !== false,
      ...options
    };

    try {
      const response = await apiClient.post('/images/generations', payload);
      return response.data;
    } catch (error) {
      console.error('Error generating with reference images:', error);
      throw error;
    }
  }
}

// Seedance 1.0 Pro Video Generation API
export class SeedanceAPI {
  static async createVideoTask(prompt, imageUrl = null, options = {}) {
    const content = [
      {
        type: "text",
        text: prompt
      }
    ];

    if (imageUrl) {
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
    }

    const payload = {
      model: "seedance-1-0-pro-fast-251015",
      content,
      ...options
    };

    try {
      const response = await apiClient.post('/contents/generations/tasks', payload);
      // Normalize response to always include task_id
      const data = response.data;
      if (data.id && !data.task_id) {
        data.task_id = data.id;
      }
      return data;
    } catch (error) {
      console.error('Error creating video task:', error);
      throw error;
    }
  }

  static async createVideoWithFrames(prompt, firstFrameUrl, lastFrameUrl, options = {}) {
    const content = [
      {
        type: "text",
        text: prompt
      },
      {
        type: "image_url",
        image_url: {
          url: firstFrameUrl
        },
        role: "first_frame"
      },
      {
        type: "image_url",
        image_url: {
          url: lastFrameUrl
        },
        role: "last_frame"
      }
    ];

    const payload = {
      model: "seedance-1-0-pro-fast-251015",
      content,
      ...options
    };

    try {
      const response = await apiClient.post('/contents/generations/tasks', payload);
      // Normalize response to always include task_id
      const data = response.data;
      if (data.id && !data.task_id) {
        data.task_id = data.id;
      }
      return data;
    } catch (error) {
      console.error('Error creating video with frames:', error);
      throw error;
    }
  }

  static async queryTask(taskId) {
    try {
      const response = await apiClient.get(`/contents/generations/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error querying task:', error);
      throw error;
    }
  }

  static async pollTaskUntilComplete(taskId, maxAttempts = 300, interval = 5000) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const result = await this.queryTask(taskId);
        
        const terminal = new Set(['succeeded', 'completed', 'failed', 'canceled', 'error']);
        if (terminal.has(result.status)) {
           return result;
      }
        
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      } catch (error) {
        console.error('Error polling task:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Task polling timeout');
  }
}

export default { SeedreamAPI, SeedanceAPI };