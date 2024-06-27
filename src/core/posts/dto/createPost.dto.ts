import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  NotContains,
} from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Post title' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Content to post' })
  content: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    default: false,
    description: 'Set post published state',
  })
  published?: string;

  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  @ApiProperty({
    description:
      'A post slug is a user-friendly and search-engine-optimized URL',
  })
  slug: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'Post tags',
  })
  tags?: string[];
}
