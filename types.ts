
export interface CloudResource {
  id: string;
  type: 'VM' | 'DATABASE' | 'STORAGE_BUCKET' | 'LOAD_BALANCER';
  region: string;
  size?: string; // e.g., 't2.micro', 'db.r5.large'
  cpuUsagePercent?: number; // Average over last 30 days
  memoryUsagePercent?: number; // Average over last 30 days
  networkTrafficGB?: number; // Per month
  idleHoursPerDay?: number; // Average over last 30 days
}

export interface OptimizationRecommendation {
  resourceId: string;
  issue: string;
  recommendation: string;
  estimatedMonthlySavings: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}
