import {
  Injectable,
} from '@nestjs/common';

import { PrismaService }
from 'src/prisma/prisma.service';

import { CreateCommentDto }
from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createComment(
    userId: string,

    ticketId: string,

    dto: CreateCommentDto,
  ) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,

        ticketId,

        authorId: userId,
      },

      include: {
        author: true,
      },
    });
  }
}