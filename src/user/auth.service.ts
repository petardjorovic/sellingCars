import { UserService } from './user.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import * as argon2 from 'argon2';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signUp(data: CreateUserDto): Promise<User> {
    // is there a user with the same email
    const existingUser = await this.userService.find(data.email);

    if (existingUser.length) {
      throw new BadRequestException('Email in use');
    }
    // hash password
    let hashedPassword: string;
    try {
      hashedPassword = await argon2.hash(data.password);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }

    // save user in db
    const newUser = await this.userService.create({
      email: data.email,
      password: hashedPassword,
    });
    // return user
    return newUser;
  }

  async signIn(data: CreateUserDto): Promise<User> {
    // check if user exist in db
    const [user] = await this.userService.find(data.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check users password
    let isValidPassword: boolean;
    try {
      isValidPassword = await argon2.verify(user.password, data.password);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }
    // return user
    return user;
  }
}
