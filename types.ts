export interface CloudResource {
  id: string;
  type: 'COMPUTE_INSTANCE' | 'DATABASE_SYSTEM' | 'OBJECT_STORAGE_BUCKET' | 'LOAD_BALANCER';
  region: string;
  size?: string; // For OCI: Shape e.g., 'VM.Standard.E4.Flex', 'BM.DenseIO2.52'
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