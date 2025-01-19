export interface Project {
  id: string;
  api_key: string;
  name: string;
  image: string;
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

export interface Metric {
  id: string;
  project_id: string;
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

export interface UserProvider {
  id: string;
  type: Provider;
}

export interface Plan {
  name: string;
  metric_limit: number;
  team_member_limit: number;
  range: number;
}

export interface Blocks {
  user_id: string;
  project_id: string;
  layout: Block[];
  labels: LabelType[];
}

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

export interface LabelType {
  name: string;
  default_color: string;
}

export enum MetricType {
  Base,
  Dual,
  Average,
  Stripe,
  Google,
  AWS,
}

export enum Provider {
  GITHUB,
  GOOGLE,
}

export enum UserRole {
  Owner,
  Admin,
  Developer,
  Guest,
}
export enum ChartType {
  Bar,
  Area,
  BarList,
  Combo,
  Pie,
  Radar,
}

export enum SubscriptionType {
  MONTHLY,
  YEARLY,
}

export enum InvoiceStatus {
  ACTIVE,
  FAILED,
}

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

export enum BlockType {
  Default,
  Group,
  Nested,
}
