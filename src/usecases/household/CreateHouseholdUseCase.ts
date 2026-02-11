// When this is used?? - When CHW taps Add new household ot taps Edit from dashboard.
import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";

interface CreateHouseholdParams {
  chwUsername: string;
  idofCHW: string;
  provinceCode: string;
  districtCode: string;
  vdcnpCode: string;
  wardNo: string;
  existingHouseholdId?: string; //only for edit-from-list
}

interface CreateHouseholdResult {
  localId: string;
}

export class CreateHouseholdUseCase {
  constructor(private householdRepo: HouseholdLocalRepository) {}

  async execute(params: CreateHouseholdParams): Promise<CreateHouseholdResult> {
    // Case 1 - Editing an existing household from server list
    if (params.existingHouseholdId) {
      const existing = await this.householdRepo.getByHouseholdId(
        params.existingHouseholdId,
      );

      // Already exists locally -> reuse
      if (existing) {
        return { localId: existing.localId };
      }

      //   Not present locally -> create local mirror
      const created = await this.householdRepo.createLocalHousehold({
        chwUsername: params.chwUsername,
        idofCHW: params.idofCHW,
        provinceCode: params.provinceCode,
        districtCode: params.districtCode,
        vdcnpCode: params.vdcnpCode,
        wardNo: params.wardNo,
      });

      //   Marked ass already synced (since it came from server)
      await this.householdRepo.markSynced(
        created.localId,
        params.existingHouseholdId,
      );

      return { localId: created.localId };
    }

    // CASE 2: Brand new household
    const created = await this.householdRepo.createLocalHousehold({
      chwUsername: params.chwUsername,
      idofCHW: params.idofCHW,
      provinceCode: params.provinceCode,
      districtCode: params.districtCode,
      vdcnpCode: params.vdcnpCode,
      wardNo: params.wardNo,
    });

    return { localId: created.localId };
  }
}
