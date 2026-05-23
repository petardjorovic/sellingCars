import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    if (!id) {
      throw new NotFoundException();
    }
    return this.userRepository.findOneBy({ id });
  }

  find(email: string): Promise<User[]> {
    return this.userRepository.find({ where: { email } });
  }

  create(data: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(data); //* hooks will be executed if we create an instance first

    return this.userRepository.save(user);
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const existingUser = await this.findById(id);

    if (!existingUser) throw new NotFoundException('User not found');

    Object.assign(existingUser, data);

    return this.userRepository.save(existingUser);
  }

  async remove(id: number): Promise<User> {
    const existingUser = await this.findById(id);

    if (!existingUser) throw new NotFoundException('User not found');

    return this.userRepository.remove(existingUser);
  }
}
