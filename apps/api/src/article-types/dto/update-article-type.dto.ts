import { PartialType } from '@nestjs/swagger';
import { CreateArticleTypeDto } from './create-article-type.dto';

export class UpdateArticleTypeDto extends PartialType(CreateArticleTypeDto) {}
