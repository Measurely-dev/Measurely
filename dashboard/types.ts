/**
 * Main project interface defining the structure of a project entity.
 * Contains core project information, user roles, metrics, and subscription details.
 */
export interface Project {
  id: string; // Unique project identifier
  api_key: string; // API key for project access
  name: string; // Project name
  image: string; // Project image/logo
  units: Unit[]; // Measurement units used in project
  user_role: UserRole; // User's role in this project
  metrics: null | Metric[]; // Project metrics
  members: null | User[]; // Project team members
  blocks: null | Blocks; // Block configurations for project
  current_plan: string; // Current subscription plan name
  subscription_type: SubscriptionType; // Monthly/yearly subscription
  max_event_per_month: number; // Maximum events allowed per month
  monthly_event_count: number; // Current month's event count
  plan: Plan; // Detailed plan information
}

/**
 * Interface for metric data including counts and metadata.
 * Tracks various metric measurements and filtering options.
 */
export interface Metric {
  id: string; // Unique metric identifier
  project_id: string; // Associated project ID
  unit: string; // Measurement unit
  name: string; // Metric name
  type: MetricType; // Type of metric
  event_count: number; // Total number of events
  total: number; // Total negative value shifted by 2 places for decimal precision
  name_pos: string; // Label for positive values
  name_neg: string; // Label for negative values
  filters: Record<string, Filter>;
  created: Date; // Creation timestamp
  last_event_timestamp: Date; // Last event time
}

export interface Filter {
  name: string;
  category: string;
}

/**
 * Interface for individual metric events tracking both absolute and relative values
 */
export interface MetricEvent {
  id: string; // Event identifier
  date: Date; // Event timestamp
  value_pos: number; // Positive value
  value_neg: number; // Negative value
  filters: string[];
}

/**
 * User interface containing basic user information and authentication details
 */
export interface User {
  id: string; // User identifier
  first_name: string; // First name
  last_name: string; // Last name
  image: string; // Profile image URL
  email: string; // Email address
  user_role: UserRole; // User permission level
  invoice_status: InvoiceStatus; // Payment status
  providers: UserProvider[]; // Authentication providers
}

/**
 * Interface for user authentication providers
 */
export interface UserProvider {
  id: string; // Provider identifier
  type: Provider; // Provider type (GitHub/Google)
}

/**
 * Subscription plan interface with usage limits
 */
export interface Plan {
  name: string; // Plan name
  metric_limit: number; // Maximum metrics allowed
  team_member_limit: number; // Maximum team members
  range: number; // Data retention range
}

/**
 * Interface for organizing blocks of content/charts
 */
export interface Blocks {
  user_id: string; // Owner user ID
  project_id: string; // Associated project ID
  layout: Block[]; // Block layout configuration
  labels: LabelType[]; // Label definitions
}

/**
 * Individual block interface for chart/content elements
 */
export interface Block {
  unique_key: string; // Unique block identifier
  id: number; // Block ID
  name: string; // Block name
  nested?: Block[]; // Nested block elements
  metric_ids: string[]; // Associated metric IDs
  filter_categories: string[]; // Filter categories
  chart_type?: ChartType; // Type of chart
  type: BlockType; // Block type
  label: string; // Block label
  color: string; // Block color
}

/**
 * Interface for block label styling
 */
export interface LabelType {
  name: string; // Label name
  default_color: string; // Default label color
}

/**
 * Enum defining different types of metrics
 */
export enum MetricType {
  Base,
  Dual,
  Average,
  Stripe,
  Google,
  AWS,
}

/**
 * Authentication provider types
 */
export enum Provider {
  GITHUB,
  GOOGLE,
}

/**
 * User permission levels
 */
export enum UserRole {
  Owner,
  Admin,
  Developer,
  Guest,
}

/**
 * Available chart visualization types
 */
export enum ChartType {
  Bar,
  Area,
  BarList,
  Combo,
  Pie,
  Radar,
}

/**
 * Subscription billing periods
 */
export enum SubscriptionType {
  MONTHLY,
  YEARLY,
}

/**
 * Invoice payment status
 */
export enum InvoiceStatus {
  ACTIVE,
  FAILED,
}

/**
 * Unit definition interface
 */
export interface Unit {
  name: string; // Unit name
  symbol: string; // Unit symbol
}

/**
 * Configuration for metric limits per chart type
 */
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

export interface ChartPoint {
  [key: string]: any;
  date: string | Date;
  label: string;
}

/**
 * Block layout types
 */
export enum BlockType {
  Default,
  Group,
  Nested,
}

export const colors = [
  {
    name: "Blue",
    index: 1,
  },
  {
    name: "Teal",
    index: 2,
  },
  {
    name: "Orange",
    index: 3,
  },
  {
    name: "Purple",
    index: 4,
  },
  {
    name: "Pink",
    index: 5,
  },
];

export const dualColors = [
  {
    name: "Default",
    indexes: [1, 2],
  },
  {
    name: "Cool",
    indexes: [2, 3],
  },
  {
    name: "Warm",
    indexes: [3, 4],
  },
  {
    name: "Hot",
    indexes: [4, 5],
  },
];
