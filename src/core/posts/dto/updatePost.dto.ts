import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  NotContains,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  content?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  published?: boolean;

  @IsOptional()
  @IsString()
  @NotContains(' ')
  @ApiPropertyOptional()
  slug?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'Post tags',
  })
  tags?: string[];
}
