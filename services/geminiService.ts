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
    You are an expert Oracle Cloud Infrastructure (OCI) Cost Optimization Bot.
    Analyze the following JSON array of OCI resources. Your goal is to identify significant cost-saving opportunities and provide actionable recommendations, just like a smart electricity meter would suggest ways to save on a bill.

    Focus on these key optimization strategies for OCI:
    1.  **Rightsizing Instances & Databases:** Identify over-provisioned Compute Instances and Database Systems based on low 'cpuUsagePercent' and 'memoryUsagePercent'. Recommend downsizing to a more appropriate OCI shape (e.g., from 'VM.Standard2.4' to 'VM.Standard.E4.Flex' with fewer OCPUs, or a smaller fixed shape).
    2.  **Pausing Idle Resources:** Pinpoint resources with high 'idleHoursPerDay'. For compute instances, recommend implementing stop/start schedules. For databases, suggest manual stop/start procedures during non-business hours to save money.
    3.  **Switching to Cheaper Options:**
        - For Compute, suggest switching to Burstable or ARM-based (Ampere) shapes if the workload is suitable.
        - For Object Storage, if usage patterns are available, recommend moving data to cheaper storage tiers (e.g., Infrequent Access, Archive).
    
    For each recommendation, provide the resource ID (ocid), a clear description of the issue, a specific and actionable recommendation, an estimated monthly savings in USD, and your confidence level. The goal is to cut cloud bills by 20-40%.

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