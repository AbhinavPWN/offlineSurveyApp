import { migration001 } from "./001_create_households";
import { migration002 } from "./002_create_household_info";

export const migrations = [migration001, migration002];
