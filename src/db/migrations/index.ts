import { migration001 } from "./001_create_households";
import { migration002 } from "./002_create_household_info";
import { migration003 } from "./003_add_gps_column";
import { migration004 } from "./004_add_idof_chw_column";
import { migration005 } from "./005_add_is_downloaded";
import { migration006 } from "./006_create_household_members";
import { migration007 } from "./007_create_address_master";
import { migration008 } from "./008_add_municipality_column";
import { migration009 } from "./009_add_mother_child_fields";

export const migrations = [
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
  migration006,
  migration007,
  migration008,
  migration009,
];
