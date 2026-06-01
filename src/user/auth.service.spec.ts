import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from './user.entity';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: Partial<UserService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUserService = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  //* SIGN UP
  it('creates new user with hashed password', async () => {
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    (mockUserService.create as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@email.com',
      password: 'hash',
    } as User);

    const user = await authService.signUp({
      email: 'test@email.com',
      password: '123456',
    });

    expect(mockUserService.find).toHaveBeenCalledTimes(1);
    expect(mockUserService.find).toHaveBeenCalledWith('test@email.com');
    expect(mockUserService.create).toHaveBeenCalledTimes(1);
    expect(mockUserService.create).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: 'hashed-password',
    });
    expect(argon2.hash).toHaveBeenCalledTimes(1);
    expect(argon2.hash).toHaveBeenCalledWith('123456');
    expect(user).toBeDefined();
    expect(user.email).toEqual('test@email.com');
  });

  it('throws an error if user signs up with email that is in use', async () => {
    (mockUserService.find as jest.Mock).mockResolvedValue([
      {
        id: 1,
        email: 'test@email.com',
        password: 'hash',
      } as User,
    ]);

    await expect(
      authService.signUp({
        email: 'test@email.com',
        password: '123456',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(mockUserService.find).toHaveBeenCalledTimes(1);
    expect(mockUserService.find).toHaveBeenCalledWith('test@email.com');
    expect(argon2.hash).not.toHaveBeenCalled();
    expect(mockUserService.create).not.toHaveBeenCalled();
  });

  it('throws an error if password hashing fails', async () => {
    (argon2.hash as jest.Mock).mockRejectedValue(new Error());

    await expect(
      authService.signUp({ email: 'test@email.com', password: '123456' }),
    ).rejects.toThrow(InternalServerErrorException);
    expect(mockUserService.find).toHaveBeenCalledTimes(1);
    expect(mockUserService.find).toHaveBeenCalledWith('test@email.com');
    expect(argon2.hash).toHaveBeenCalledTimes(1);
    expect(argon2.hash).toHaveBeenCalledWith('123456');
    expect(mockUserService.create).not.toHaveBeenCalled();
  });

  //* SIGN IN
  it('throws an error if user not found', async () => {
    await expect(
      authService.signIn({ email: 'missing@test.com', password: '123456' }),
    ).rejects.toThrow(NotFoundException);
    expect(mockUserService.find).toHaveBeenCalledTimes(1);
    expect(mockUserService.find).toHaveBeenCalledWith('missing@test.com');
    expect(argon2.verify).not.toHaveBeenCalled();
  });

  it('throws an error if password is invalid', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(false);
    (mockUserService.find as jest.Mock).mockResolvedValue([
      { id: 1, email: 'test@email.com', password: 'hash' } as User,
    ]);

    await expect(
      authService.signIn({ email: 'test@email.com', password: '123456' }),
    ).rejects.toThrow(BadRequestException);
    expect(mockUserService.find).toHaveBeenCalledTimes(1);
    expect(mockUserService.find).toHaveBeenCalledWith('test@email.com');
    expect(argon2.verify).toHaveBeenCalledTimes(1);
    expect(argon2.verify).toHaveBeenCalledWith('hash', '123456');
  });

  it('throws an error if password verifying fails', async () => {
    (argon2.verify as jest.Mock).mockRejectedValue(new Error());
    (mockUserService.find as jest.Mock).mockResolvedValue([
      { id: 1, email: 'test@email.com', password: 'hash' } as User,
    ]);

    await expect(
      authService.signIn({ email: 'test@email.com', password: '123456' }),
    ).rejects.toThrow(InternalServerErrorException);
    expect(mockUserService.find).toHaveBeenCalledTimes(1);
    expect(mockUserService.find).toHaveBeenCalledWith('test@email.com');
    expect(argon2.verify).toHaveBeenCalledTimes(1);
    expect(argon2.verify).toHaveBeenCalledWith('hash', '123456');
  });

  it('signs in and returns user if email and password is correct', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    (mockUserService.find as jest.Mock).mockResolvedValue([
      { id: 1, email: 'test@email.com', password: 'hash' } as User,
    ]);
    const user = await authService.signIn({
      email: 'test@email.com',
      password: '123456',
    });

    expect(user).toBeDefined();
    expect(user.email).toEqual('test@email.com');
    expect(user.password).toEqual('hash');
    expect(mockUserService.find).toHaveBeenCalledTimes(1);
    expect(mockUserService.find).toHaveBeenCalledWith('test@email.com');
    expect(argon2.verify).toHaveBeenCalledTimes(1);
    expect(argon2.verify).toHaveBeenCalledWith('hash', '123456');
  });
});
