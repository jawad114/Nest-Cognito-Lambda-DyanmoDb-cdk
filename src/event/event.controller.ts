import { Controller, Get, Post, Body, Delete, Param, UseGuards, Put } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('event')

export class EventController {
    constructor(private readonly eventService: EventService) {}
  
    
    @Post()
    async createEvent(@Body() createEventDto: CreateEventDto) {
      return this.eventService.createEvent(createEventDto);
    }
  
    
    @Get()
    async getAllEvents() {
      return this.eventService.getAllEvents();
    }
  
 
    @Get(':id')
    async getEventById(@Param('id') id: string) {
      return this.eventService.getEventById(id);
    }
  
   
    @Put(':id')
    async updateEvent(
      @Param('id') id: string,
      @Body() updateEventDto: UpdateEventDto,
    ) {
      return this.eventService.updateEvent(id, updateEventDto);
    }
  
 
    @Delete(':id')
    async deleteEvent(@Param('id') id: string) {
      return this.eventService.deleteEvent(id);
    }
  }