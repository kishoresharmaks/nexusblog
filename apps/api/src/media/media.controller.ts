import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CreatePresignedUrlDto, ConfirmUploadDto } from './dto/create-presigned-url.dto';
import { UpdateMediaDto, QueryMediaDto } from './dto/update-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('upload')
  @ApiOperation({ summary: 'Upload an image and generate optimized variants (Auth or Guest)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string' },
        caption: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml|avif)$/)) {
          return cb(
            new BadRequestException(
              'Unsupported file format. Please upload JPG, PNG, WebP, GIF, AVIF, or SVG.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body('alt') alt?: string,
    @Body('caption') caption?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided in upload request');
    }
    return this.mediaService.uploadFile(file, user?.id || null, alt, caption);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR')
  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate a presigned upload URL for direct R2/S3 upload' })
  createPresignedUrl(
    @Body() dto: CreatePresignedUrlDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.mediaService.createPresignedUploadUrl(dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR')
  @Post('confirm-upload')
  @ApiOperation({ summary: 'Confirm completed direct R2/S3 upload' })
  confirmPresignedUpload(
    @Body() dto: ConfirmUploadDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.mediaService.confirmPresignedUpload(dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'USER')
  @Get()
  @ApiOperation({ summary: 'Get paginated list of uploaded media (isolated per user for non-staff)' })
  findAll(@Query() query: QueryMediaDto, @CurrentUser() user: any) {
    const isStaff =
      user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'EDITOR';
    return this.mediaService.findAll(query, isStaff ? undefined : user?.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get media details by ID' })
  findById(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Update media alt text or caption' })
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.mediaService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete media (with article reference protection)' })
  delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}

