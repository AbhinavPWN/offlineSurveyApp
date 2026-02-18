import { migration001 } from "./001_create_households";
import { migration002 } from "./002_create_household_info";
import { migration003 } from "./003_add_gps_column";
import { migration004 } from "./004_add_idof_chw_column";

export const migrations = [
  migration001,
  migration002,
  migration003,
  migration004,
];
