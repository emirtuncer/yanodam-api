import { IsString } from 'class-validator';

export class RegisterUniversityDto {
  @IsString()
  university: string;

  @IsString()
  faculty: string;
}
