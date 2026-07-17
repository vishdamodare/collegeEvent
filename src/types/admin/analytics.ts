export interface TimeSeriesData {
  label: string;
  value: number;
}

export interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface PopularEventData {
  id: string;
  title: string;
  registrations: number;
  revenue: number;
  conversionRate: number;
}

export interface GeographicBreakdown {
  city: string;
  registrations: number;
  percentage: number;
}

export interface CollegeBreakdown {
  college: string;
  registrations: number;
}

export interface DeviceBreakdown {
  device: "Desktop" | "Mobile" | "Tablet";
  percentage: number;
}

export interface ConversionFunnelStep {
  step: string;
  count: number;
  percentage: number; // Percentage of initial step
}

export interface AnalyticsSummary {
  dailyRegistrations: TimeSeriesData[];
  monthlyRegistrations: TimeSeriesData[];
  categoryRegistrations: CategoryData[];
  popularEvents: PopularEventData[];
  citiesBreakdown: GeographicBreakdown[];
  collegesBreakdown: CollegeBreakdown[];
  deviceBreakdown: DeviceBreakdown[];
  conversionFunnel: ConversionFunnelStep[];
  overallConversionRate: number;
  returningUsersPercentage: number;
  averageAttendanceRate: number;
}
