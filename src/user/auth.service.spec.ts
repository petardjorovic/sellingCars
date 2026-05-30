import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { it } from 'node:test';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const fakeUserService: Partial<UserService> = {
      find: () => Promise.resolve([]),
      create: (data: CreateUserDto) =>
        Promise.resolve({
          id: 1,
          email: data.email,
          password: data.password,
        } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates new user with hashed password', async () => {
    const user = await service.signUp({
      email: 'test@test.com',
      password: '123456',
    });

    expect(user.password).not.toEqual('123456');
  });
});
