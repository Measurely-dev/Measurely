// Main project interface defining the structure of a project entity
export interface Project {
  id: string;
  api_key: string;
  name: string;
  image: string;
  units: Unit[];
  user_role: UserRole;
  metrics: null | Metric[];
  members: null | User[];
  blocks: null | Blocks;
  current_plan: string;
  subscription_type: SubscriptionType;
  max_event_per_month: number;
  monthly_event_count: number;
  plan: Plan;
}

// Interface for metric data including counts and metadata
export interface Metric {
  id: string;
  project_id: string;
  unit: string;
  name: string;
  type: MetricType;
  event_count: number;
  total_pos: number;
  total_neg: number;
  name_pos: string;
  name_neg: string;
  filters: {
    [category: string]: Metric[];
  };
  filter_category: string;
  created: Date;
  last_event_timestamp: { Valid: boolean; V: Date };
}

// Interface for individual metric events with relative and absolute values
export interface MetricEvent {
  id: string;
  date: Date;
  value_pos: number;
  value_neg: number;
  event_count: number;
  relative_total_pos: number;
  relative_total_neg: number;
  relative_event_count: number;
}

// User interface containing basic user information and authentication details
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  image: string;
  email: string;
  user_role: UserRole;
  invoice_status: InvoiceStatus;
  providers: UserProvider[];
}

// Interface for user authentication providers
export interface UserProvider {
  id: string;
  type: Provider;
}

// Subscription plan interface with usage limits
export interface Plan {
  name: string;
  metric_limit: number;
  team_member_limit: number;
  range: number;
}

// Interface for organizing blocks of content/charts
export interface Blocks {
  user_id: string;
  project_id: string;
  layout: Block[];
  labels: LabelType[];
}

// Individual block interface for chart/content elements
export interface Block {
  unique_key: string;
  id: number;
  name: string;
  nested?: Block[];
  metric_ids: string[];
  filter_categories: string[];
  chart_type?: ChartType;
  type: BlockType;
  label: string;
  color: string;
}

// Interface for block label styling
export interface LabelType {
  name: string;
  default_color: string;
}

// Enum defining different types of metrics
export enum MetricType {
  Base,
  Dual,
  Average,
  Stripe,
  Google,
  AWS,
}

// Authentication provider types
export enum Provider {
  GITHUB,
  GOOGLE,
}

// User permission levels
export enum UserRole {
  Owner,
  Admin,
  Developer,
  Guest,
}

// Available chart visualization types
export enum ChartType {
  Bar,
  Area,
  BarList,
  Combo,
  Pie,
  Radar,
}

// Subscription billing periods
export enum SubscriptionType {
  MONTHLY,
  YEARLY,
}

// Invoice payment status
export enum InvoiceStatus {
  ACTIVE,
  FAILED,
}

export interface Unit {
  name: string;
  symbol: string;
}

// Configuration for metric limits per chart type
export const chartTypeMetricLimits: Record<
  ChartType,
  { min: number; max: number }
> = {
  [ChartType.Area]: { min: 1, max: 4 },
  [ChartType.Bar]: { min: 1, max: 4 },
  [ChartType.Combo]: { min: 2, max: 2 },
  [ChartType.Pie]: { min: 1, max: 1 },
  [ChartType.Radar]: { min: 1, max: 1 },
  [ChartType.BarList]: { min: 1, max: 1 },
};

// Block layout types
export enum BlockType {
  Default,
  Group,
  Nested,
}

// Available color options for charts and UI elements
export type AllowedColors =
  | 'blue'
  | 'red'
  | 'green'
  | 'pink'
  | 'gray'
  | 'fuchsia'
  | 'cyan'
  | 'violet'
  | 'lime'
  | 'purple'
  | 'orange'
  | 'yellow'
  | 'indigo'
  | 'magenta'
  | 'teal'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'emerald'
  | 'coral'
  | 'mint';

// Interface mapping color names to their values
export interface ChartColors {
  blue: string;
  red: string;
  green: string;
  pink: string;
  gray: string;
  fuchsia: string;
  cyan: string;
  violet: string;
  lime: string;
  purple: string;
  orange: string;
  yellow: string;
  indigo: string;
  magenta: string;
  teal: string;
  amber: string;
  rose: string;
  sky: string;
  emerald: string;
  coral: string;
  mint: string;
}

// Color palette configurations for dual metric charts
export interface DualMetricChartColors {
  default: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  cool: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  warm: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  contrast: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  soft: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  vibrant: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  neutral: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  pastel: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  sunset: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  ocean: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  forest: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
}
