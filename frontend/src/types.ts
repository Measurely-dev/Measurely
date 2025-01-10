export interface Project {
  id: string;
  apikey: string;
  name: string;
  image: string;
  userrole: UserRole;
  metrics: null | Metric[];
  members: null | User[];
  blocks: null | Blocks;
}

export interface Metric {
  id: string;
  projectid: string;
  name: string;
  type: MetricType;
  eventcount: number;
  totalpos: number;
  totalneg: number;
  namepos: string;
  nameneg: string;
  filters: {
    [category: string]: Metric[];
  };
  filtercategory: string;
  created: Date;
}

export interface MetricEvent {
  id: string;
  date: Date;
  valuepos: number;
  valueneg: number;
  eventcount: number;
  relativetotalpos: number;
  relativetotalneg: number;
  relativeeventcount: number;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  image: string;
  email: string;
  plan: Plan;
  providers: UserProvider[];
  userrole: UserRole;
  eventcount: number;
}

export interface UserProvider {
  id: string;
  type: Provider;
}

export interface Plan {
  name: string;
  identifier: string;
  projectlimit: number;
  metric_per_project_limit: number;
  requestlimit: number;
  monthlyeventlimit: number;
}

export interface Blocks {
  userid: string;
  projectid: string;
  layout: Block[];
  labels: string[];
}

export interface Block {
  id: number;
  name: string;
  colSpan: number;
  nested?: Block[];
  metricIds: string[];
  chartType?: ChartType;
  type: BlockType;
  label: string;
  color: string;
}

export enum MetricType {
  Base,
  Dual,
  Average,
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

export enum BlockType {
  Default,
  Group,
  Nested,
}
