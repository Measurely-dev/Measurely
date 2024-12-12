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
  enabled: boolean;
  type: GroupType;
}

export interface Metric {
  id: string;
  name: string;
  total: number;
  monthly: MetricEvent[];
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
  userid: string;
  provider: Provider;
  provideruserid: string;
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
