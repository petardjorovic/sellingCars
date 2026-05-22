import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from '../decorators/serialize.decorator';
import { UserDto } from './dtos/user.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Serialize(UserDto)
  @Get()
  findAllUsers(@Query('email') email: string): Promise<User[]> {
    return this.userService.find(email);
  }

  @Get(':id')
  findUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.remove(id);
  }
}
