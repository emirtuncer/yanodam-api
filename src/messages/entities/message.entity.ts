import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Message {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsNumber()
  to: number;

  @IsNotEmpty()
  @IsNumber()
  from: number;

  @IsBoolean()
  delivered: boolean;

  @IsBoolean()
  seen: boolean;
}
