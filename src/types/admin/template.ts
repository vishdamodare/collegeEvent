import { AdminEvent } from "./event";

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  prefilledData: Partial<AdminEvent>;
}
