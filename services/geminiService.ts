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

export async function analyzeResources(resources: CloudResource[]): Promise<OptimizationRecommendation[]> {
  // Initialize the GoogleGenAI client here to ensure it uses the provided API key from the environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    throw new Error("Failed to get optimization recommendations from the AI. The model may be unable to process the request.");
  }
}