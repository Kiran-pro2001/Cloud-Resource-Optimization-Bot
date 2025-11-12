
import { GoogleGenAI, Type } from "@google/genai";
import type { OptimizationRecommendation, CloudResource } from '../types';

const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    resourceId: {
      type: Type.STRING,
      description: "The ID of the cloud resource being analyzed.",
    },
    issue: {
      type: Type.STRING,
      description: "A concise description of the identified inefficiency or waste (e.g., 'Over-provisioned CPU', 'Idle Resource').",
    },
    recommendation: {
      type: Type.STRING,
      description: "The specific, actionable recommendation to optimize the resource (e.g., 'Downsize instance to t2.small', 'Enable auto-shutdown during non-business hours').",
    },
    estimatedMonthlySavings: {
      type: Type.NUMBER,
      description: "The estimated cost savings in USD per month if the recommendation is implemented.",
    },
    confidence: {
        type: Type.STRING,
        enum: ['HIGH', 'MEDIUM', 'LOW'],
        description: "The confidence level of this recommendation.",
    }
  },
  required: ['resourceId', 'issue', 'recommendation', 'estimatedMonthlySavings', 'confidence'],
};

export async function analyzeResources(resources: CloudResource[], apiKey: string): Promise<OptimizationRecommendation[]> {
  if (!apiKey) {
    throw new Error("API Key must be provided to analyze resources.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following JSON array of cloud resources. Identify opportunities for cost savings and provide actionable recommendations.
    Focus on:
    1.  Idle Resources: High idleHoursPerDay.
    2.  Over-provisioned Resources: Low cpuUsagePercent or memoryUsagePercent. Suggest downsizing.
    3.  Wrong Service Tiers: Consider if a different storage class or database type would be cheaper for the given usage.

    Resource Data:
    ${JSON.stringify(resources, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: recommendationSchema
        },
        temperature: 0.2
      }
    });

    const responseText = response.text.trim();
    if (!responseText) {
        return [];
    }
    const recommendations: OptimizationRecommendation[] = JSON.parse(responseText);
    return recommendations;
  } catch (error) {
    console.error("Error analyzing resources with Gemini API:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
       throw new Error("The provided API Key is not valid. Please check your key and try again.");
    }
    throw new Error("Failed to get optimization recommendations from the AI. This could be due to an invalid API key or a network issue.");
  }
}