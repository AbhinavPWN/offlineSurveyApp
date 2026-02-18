import { HouseholdDashboardScreen } from "@/src/screens/HouseholdDashboardScreen";
import { householdLocalRepository } from "@/src/di/container";
import { CreateHouseholdUseCase } from "@/src/usecases/household/CreateHouseholdUseCase";

const createHouseholdUseCase = new CreateHouseholdUseCase(
  householdLocalRepository,
);

export default function HouseholdsRoute() {
  return (
    <HouseholdDashboardScreen
      householdRepo={householdLocalRepository}
      createHouseholdUseCase={createHouseholdUseCase}
    />
  );
}
