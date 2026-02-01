import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MarkNotificationAsReadCommand, MarkAllNotificationsAsReadCommand } from './cqrs/commands/impl/notification-commands.impl';
import { FindNotificationsByUserQuery, FindUnreadNotificationsByUserQuery } from './cqrs/queries/impl/notification-queries.impl';
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Get all user notifications',
    description: 'Retrieves a complete list of notifications for the currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully' })
  @Get()
  findAllForUser(@Request() req) {
    return this.queryBus.execute(new FindNotificationsByUserQuery(req.user.userId));
  }

  @ApiOperation({
    summary: 'Get unread notifications',
    description: 'Retrieves only the unread notifications for the currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of unread notifications retrieved' })
  @Get('unread')
  findUnreadForUser(@Request() req) {
    return this.queryBus.execute(new FindUnreadNotificationsByUserQuery(req.user.userId));
  }

  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Updates the status of a specific notification to read.',
  })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.commandBus.execute(new MarkNotificationAsReadCommand(id));
  }

  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Updates all notifications for the currently authenticated user to read status.',
  })
  @ApiResponse({ status: 200, description: 'All notifications successfully marked as read' })
  @Post('read-all')
  markAllAsRead(@Request() req) {
    return this.commandBus.execute(new MarkAllNotificationsAsReadCommand(req.user.userId));
  }
}