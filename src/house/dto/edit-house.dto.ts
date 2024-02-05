import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class EditHouseDto {
  @IsInt()
  @IsOptional()
  peopleCount?: number;

  @IsInt()
  @IsOptional()
  rooms?: number;

  @IsInt()
  @IsOptional()
  bathrooms?: number;

  @IsInt()
  @IsOptional()
  rentCost?: number;

  @IsInt()
  @IsOptional()
  totalFloor?: number;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsOptional()
  @IsBoolean()
  pet?: boolean;

  @IsOptional()
  @IsBoolean()
  smoke?: boolean;

  @IsOptional()
  @IsBoolean()
  alcohol?: boolean;

  @IsOptional()
  @IsBoolean()
  food?: boolean;

  @IsOptional()
  @IsBoolean()
  airCondition?: boolean;

  @IsOptional()
  @IsString()
  internet?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
