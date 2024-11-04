import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { COGNITO_REGION } from 'src/auth/constants';

@Injectable()
export class EventService {
  private readonly dynamoDbClient = new DynamoDBClient({
    region: COGNITO_REGION,
  });
  private readonly dynamoDb = DynamoDBDocumentClient.from(this.dynamoDbClient);
  private readonly tableName = 'EventsTable';

  async createEvent(createEventDto: CreateEventDto) {
    const newEvent = {
      eventId: Date.now().toString(), 
      ...createEventDto,
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: this.tableName,
      Item: newEvent,
    };

    await this.dynamoDb.send(new PutCommand(params));
    return newEvent;
  }

  async getAllEvents() {
    const params = {
      TableName: this.tableName,
    };

    const data = await this.dynamoDb.send(new ScanCommand(params));
    return data.Items;
  }

  async getEventById(eventId: string) { 
    const params = {
      TableName: this.tableName,
      Key: { eventId },
    };

    const result = await this.dynamoDb.send(new GetCommand(params));
    const event = result.Item;

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async updateEvent(eventId: string, updateEventDto: UpdateEventDto) {
    const params = {
      TableName: this.tableName,
      Key: { eventId }, 
      UpdateExpression: 'set #title = :title, #date = :date',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':title': updateEventDto.title,
        ':date': updateEventDto.date,
      },
      ReturnValues: 'UPDATED_NEW' as ReturnValue,
    };

    const result = await this.dynamoDb.send(new UpdateCommand(params));
    return result.Attributes;
  }

  async deleteEvent(eventId: string) {
    const params = {
      TableName: this.tableName,
      Key: { eventId }, 
    };

    await this.dynamoDb.send(new DeleteCommand(params));
    return { message: 'Event deleted successfully' };
  }
}
