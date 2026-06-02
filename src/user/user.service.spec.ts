import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';

type MockUserRepository = {
  findOneBy: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
};

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: MockUserRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUserRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findById should return user', async () => {
    const user = {
      id: 1,
      email: 'test@email.com',
    } as User;

    mockUserRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findById(1);

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(user);
  });

  it('returns null if user does not exists', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    const result = await service.findById(1);

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toBeNull();
  });

  it('throws an error if id not valid', async () => {
    await expect(service.findById(0)).rejects.toThrow(BadRequestException);

    expect(mockUserRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('returns users matching email', async () => {
    const users = [
      { id: 1, email: 'test@email.com' } as User,
      { id: 2, email: 'test@email.com' } as User,
    ];
    mockUserRepository.find.mockResolvedValue(users);

    const result = await service.find('test@email.com');

    expect(result).toEqual(users);
    expect(mockUserRepository.find).toHaveBeenCalledWith({
      where: { email: 'test@email.com' },
    });
  });

  it('returns empty array if users not found with provided email', async () => {
    mockUserRepository.find.mockResolvedValue([]);

    const result = await service.find('test@email.com');

    expect(result).toEqual([]);
    expect(mockUserRepository.find).toHaveBeenCalledWith({
      where: { email: 'test@email.com' },
    });
  });

  it('creates and returns a new user', async () => {
    const user = {
      id: 1,
      email: 'test@email.com',
      password: '123456',
    } as User;

    mockUserRepository.create.mockReturnValue(user);
    mockUserRepository.save.mockResolvedValue(user);

    const result = await service.create({
      email: 'test@email.com',
      password: '123456',
    });

    expect(result).toEqual(user);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: '123456',
    });
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });

  it('updates and returns updated user', async () => {
    const user = { id: 1, email: 'test@email.com', password: '123456' } as User;

    jest.spyOn(service, 'findById').mockResolvedValue(user);

    mockUserRepository.save.mockResolvedValue({
      id: 1,
      email: 'updated@email.com',
      password: '123456',
    });

    const result = await service.update(1, { email: 'updated@email.com' });

    expect(service.findById).toHaveBeenCalledWith(1);

    expect(mockUserRepository.save).toHaveBeenCalledWith({
      id: 1,
      email: 'updated@email.com',
      password: '123456',
    });

    expect(result).toEqual({
      id: 1,
      email: 'updated@email.com',
      password: '123456',
    });
  });

  it('throws an error if updating user does not exist', async () => {
    jest.spyOn(service, 'findById').mockResolvedValue(null);

    await expect(
      service.update(1, { email: 'updated@email.com' }),
    ).rejects.toThrow(NotFoundException);

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('removes and returns removed user', async () => {
    const user = { id: 1, email: 'test@email.com', password: '123456' } as User;

    jest.spyOn(service, 'findById').mockResolvedValue(user);

    mockUserRepository.remove.mockResolvedValue(user);

    const result = await service.remove(1);

    expect(service.findById).toHaveBeenCalledWith(1);
    expect(mockUserRepository.remove).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('throws an error if removing user for does not exist', async () => {
    jest.spyOn(service, 'findById').mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    expect(service.findById).toHaveBeenCalledWith(1);
    expect(mockUserRepository.remove).not.toHaveBeenCalled();
  });
});
