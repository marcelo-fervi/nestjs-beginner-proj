import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { CreateTaskBody } from './db_schemes/create_task_body';
import { DeleteTaskBody } from './db_schemes/delete_task_body';
import { UpdateTaskBody } from './db_schemes/update_task_body';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private prisma: PrismaService
  ) {}
  
  @Get("")
  async hello() {
    return this.appService.getHello();
  }

  @Post("createTask")
  async createTask(
    @Body() body: CreateTaskBody
    ) {
    const taskName = body.name;
    const unhashedPassw = body.password;
    const hashedPassword = await bcrypt.hash(unhashedPassw, 10);

    const taskItem = await this.prisma.nestTask.create({
      data: {
        login: body.login,
        password: hashedPassword,
        name: taskName
      }
    });

    if (taskItem) {
      return {success: true}
    }

    return {success: false};
  }

  @Get("readTask/:TASK_ID/:ACC_TOKEN")
  async readTask(
    @Param('ACC_TOKEN') accessToken: string,
    @Param('TASK_ID') taskIdAsStr: string
    ) {
    if (!await this.authService.validateAccessToken(accessToken)) {
      return;
    }

    const taskId = Number(taskIdAsStr);

    const taskItem = await this.prisma.nestTask.findFirst({
      where: {
        id: taskId
      }
    });

    if (!taskItem) {
      return {success: false};
    }

    return {
      success: true,
      login: taskItem.login,
      name: taskItem.name,
      is_active: taskItem.is_active
    };
  }

  
  @Put("updateTask")
  async updateTask(
    @Body() body: UpdateTaskBody
    ) {
    if (!await this.authService.validateAccessToken(body.access_token)) {
      return;
    }

    const taskId = Number(body.id);
    const newTaskName = body.name;
    
    const taskItem = await this.prisma.nestTask.update({
      where: {
        id: taskId
      },
      data: {
        name: newTaskName
      }
    });

    return {
      success: (taskItem != null)
    };
  }

  
  @Delete("deleteTask")
  async deleteTask(
    @Body() body: DeleteTaskBody
    ) {
    if (!await this.authService.validateAccessToken(body.access_token)) {
      return;
    }
    
    const taskId = Number(body.id);
    
    try {
      const taskItem = await this.prisma.nestTask.delete({
        where: {
          id: taskId
        }
      });

      return {
        success: (taskItem != null)
      };
    }
    catch {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'deletion error',
      }, HttpStatus.CONFLICT);
    }
  }
}