export interface Application {
  id: string;
  apikey: string;
  name: string;
  image: string;
  groups: null | Group[];
}

export interface Group {
  id: string;
  appid: string;
  name: string;
  metrics: Metric[];
  created: Date;
  type: GroupType;
}

export interface Metric {
  id: string;
  name: string;
  total: number;
}

export interface MetricEvent {
  id: string;
  date: Date;
  value: number;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  image: string;
  email: string;
  plan: string;
  providers: UserProvider[];
}

export interface UserProvider {
  id: string;
  type: Provider;
}

export interface Plan {
  name: string;
  identifier: string;
  price: number;
  app_limit: number;
  metric_per_app_limit: number;
}

export enum GroupType {
  Base,
  Dual,
}

export enum Provider {
  EMAIL,
  GITHUB,
  GOOGLE,
}
