import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
  // UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from '../decorators/serialize.decorator';
import { UserDto } from './dtos/user.dto';
import { Public } from '../decorators/public.decorator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';
// import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';

@Controller('auth')
@UseGuards(AuthGuard)
@Serialize(UserDto)
// @UseInterceptors(CurrentUserInterceptor)  //* if you want to apply interceptor to this controller
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('whoami')
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Public()
  @Post('signup')
  async createUser(
    @Session() session: Record<string, any>,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    const user = await this.authService.signUp(createUserDto);
    session.userId = user.id;
    return user;
  }

  @Public()
  @Post('signin')
  @HttpCode(200)
  async signIn(
    @Session() session: Record<string, any>,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    const user = await this.authService.signIn(createUserDto);
    session.userId = user.id;
    return user;
  }

  @Get('signOut')
  signOut(@Session() session: Record<string, any>) {
    session.userId = null;
  }

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

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.remove(id);
  }
}
