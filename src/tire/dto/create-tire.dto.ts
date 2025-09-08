export class CreateTireDto {
  companyId: string;
  vehicleId?: string;
  customId: string;
  brand: string;
  design: string;
  initialDepth: number;
  dimension: string;
  axis: string;
  cost: {
    value: number;
    date: string;
    supplier: string;
  };
  condition: 'new' | 'retread1' | 'retread2';
  position?: number; // Add this field as optional number
}