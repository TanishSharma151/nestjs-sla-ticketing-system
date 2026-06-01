import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard }
from 'src/auth/guards/jwt-auth.guard';

import { CreateCommentDto }
from './dto/create-comment.dto';

import { CommentsService }
from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
  ) {}

  @Post(':ticketId')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Req() req: any,

    @Param('ticketId')
    ticketId: string,

    @Body()
    dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      req.user.userId,

      ticketId,

      dto,
    );
  }
}