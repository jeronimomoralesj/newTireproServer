export class CreateConditionDto {
  tireId: string;
  value: string;
  date: string;
  design?: string | null;
  cost?: number | null;
  provider?: string | null;
  motive?: string | null;
  remainingMM?: number | null;
}
