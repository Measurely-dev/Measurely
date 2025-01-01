export interface Project {
  id: string;
  apikey: string;
  name: string;
  image: string;
  metrics: null | Metric[];
}

export interface Metric {
  id: string;
  appid: string;
  name: string;
  type: MetricType;
  totalpos: number;
  totalneg: number;
  namepos: string;
  nameneg: string;
  created: Date;
}

export interface MetricEvent {
  id: string;
  date: Date;
  valuepos: number;
  valueneg: number;
  relativetotalpos: number;
  relativetotalneg: number;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  image: string;
  email: string;
  plan: Plan;
  providers: UserProvider[];
  eventcount: number;
}

export interface UserProvider {
  id: string;
  type: Provider;
}

export interface Plan {
  name: string;
  identifier: string;
  applimit: number;
  metric_per_app_limit: number;
  requestlimit: number;
  monthlyeventlimit: number;
}

export enum MetricType {
  Base,
  Dual,
}

export enum Provider {
  GITHUB,
  GOOGLE,
}
