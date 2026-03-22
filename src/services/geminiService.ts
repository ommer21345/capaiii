export interface CaptionOptions {
  tone: string;
  platform: string;
  language: string;
  additionalContext?: string;
}

export interface Caption {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

export interface CaptionResponse {
  captions?: Caption[];
  text?: string;
  isRaw: boolean;
  error?: string;
}

export async function generateCaptions(imageData: string, options: CaptionOptions): Promise<CaptionResponse> {
  try {
    const response = await fetch('/api/generate-captions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData, options }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate captions');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Caption Generation Error:', error);
    return { isRaw: true, error: error.message };
  }
}
