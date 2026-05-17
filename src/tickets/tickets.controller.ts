import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
    Patch,
    Param,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';


@Controller('tickets')
export class TicketsController {
    constructor(
        private ticketsService: TicketsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    createTicket(
        @Req() req: any,
        @Body() dto: CreateTicketDto,
    ) {
        return this.ticketsService.createTicket(
            req.user.userId,
            dto,
        );
    }
    @UseGuards(JwtAuthGuard)
    @Get()
    getTickets(@Req() req: any) {
        return this.ticketsService.getTickets(
            req.user.userId,
        );
    }
    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    updateStatus(
        @Req() req: any,
        @Param('id') ticketId: string,
        @Body() dto: UpdateTicketStatusDto,
    ) {
        return this.ticketsService.updateStatus(
            req.user.userId,
            ticketId,
            dto,
        );
    }
    @UseGuards(JwtAuthGuard)
    @Patch(':id/assign')
    assignTicket(
        @Req() req: any,
        @Param('id') ticketId: string,
        @Body() dto: AssignTicketDto,
    ) {
        return this.ticketsService.assignTicket(
            req.user.userId,
            ticketId,
            dto,
        );
    }

}