import { Module } from '@nestjs/common';

import { SlaController }
  from './sla.controller';

import { SlaService }
  from './sla.service';

import { PrismaModule }
  from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [SlaController],

  providers: [SlaService],
})
export class SlaModule {}