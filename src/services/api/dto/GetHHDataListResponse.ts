import { HouseholdListingDTO } from "./HouseholdListingDTO";

export interface GetHHDataListResponse {
  request_id: string;
  response_code: string;
  response_message: string;
  properties: HouseholdListingDTO[];
}
