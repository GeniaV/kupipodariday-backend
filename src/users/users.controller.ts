import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/types/types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getUser(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get(':username')
  async getUserbyName(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException();
    }
    delete user.password;
    delete user.email;
    return user;
  }

  @Post('find')
  async findUserByEmailOrUserName(@Body() query: { [key: string]: string }) {
    return await this.usersService.findMany(query);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('me')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.updateOne(req.user.id, updateUserDto);
  }

  @Delete(':id')
  async removeById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException();
    }
    await this.usersService.removeOne(id);
  }
}
