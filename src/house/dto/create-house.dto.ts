import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHouseDto {
  @IsInt()
  @IsNotEmpty()
  peopleCount: number;

  @IsInt()
  @IsNotEmpty()
  rooms: number;

  @IsInt()
  @IsNotEmpty()
  bathrooms: number;

  @IsInt()
  @IsNotEmpty()
  rentCost: number;

  @IsInt()
  @IsNotEmpty()
  totalFloor: number;

  @IsInt()
  @IsNotEmpty()
  floor: number;

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
