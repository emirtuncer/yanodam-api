import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class EditUserDto {
  name?: string;

  @IsEmail()
  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @IsOptional()
  igUsername?: string;

  @IsUrl()
  @IsOptional()
  profilePhotoUrl?: string;
}
