export interface Application {
  id: string;
  apikey : string;
  name: string;
  description: string;
  image: string;
  groups: null | Group[]
}

export interface Group{
  name: string;
  value: number;
  metrics : Metric[];
  created: string;
}

export interface Metric {
  name: string;
  value: number;
}

export interface User {
  firstname: string;
  lastname: string;
  image: string;
  email: string;
}

export interface Plan {
  name: string;
  identifier: string;
  price: number;
  app_limit: number;
  metric_per_app_limit: number;
}

