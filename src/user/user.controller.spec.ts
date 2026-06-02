import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

type MockUserService = {
  findById: jest.Mock;
  find: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

type MockAuthService = {
  signUp: jest.Mock;
  signIn: jest.Mock;
};

type MockSession = {
  userId?: number | null;
};

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: MockUserService;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUserService = {
      findById: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    mockAuthService = {
      signUp: jest.fn(),
      signIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns current user', () => {
    const user = {
      id: 1,
      email: 'test@email.com',
    } as User;

    expect(controller.whoAmI(user)).toEqual(user);
  });

  it('creates new user and stores id in session', async () => {
    const user = {
      id: 1,
      email: 'test@email.com',
    } as User;
    const session: MockSession = {};

    mockAuthService.signUp.mockResolvedValue(user);

    const result = await controller.createUser(session, {
      email: 'test@email.com',
      password: '123456',
    });

    expect(session.userId).toEqual(1);
    expect(mockAuthService.signUp).toHaveBeenCalledTimes(1);
    expect(mockAuthService.signUp).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: '123456',
    });
    expect(result).toEqual(user);
  });

  it('signs in user and stores id in session', async () => {
    const user = {
      id: 1,
      email: 'test@email.com',
    } as User;
    const session: MockSession = {};

    mockAuthService.signIn.mockResolvedValue(user);

    const result = await controller.signIn(session, {
      email: 'test@email.com',
      password: '123456',
    });

    expect(session.userId).toEqual(1);
    expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
    expect(mockAuthService.signIn).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: '123456',
    });
    expect(result).toEqual(user);
  });

  it('clears session on sign out', () => {
    const session: MockSession = {
      userId: 1,
    };
    controller.signOut(session);

    expect(session.userId).toBeNull();
  });

  it('returns users matching email', async () => {
    const users = [
      {
        id: 1,
        email: 'test@email.com',
      } as User,
      {
        id: 2,
        email: 'test@email.com',
      } as User,
    ];

    mockUserService.find.mockResolvedValue(users);

    const result = await controller.findAllUsers('test@email.com');

    expect(mockUserService.find).toHaveBeenCalledWith('test@email.com');
    expect(result).toEqual(users);
  });

  it('returns user by id', async () => {
    const user = {
      id: 1,
      email: 'test@email.com',
    } as User;

    mockUserService.findById.mockResolvedValue(user);

    const result = await controller.findUser(1);

    expect(mockUserService.findById).toHaveBeenCalledTimes(1);
    expect(mockUserService.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(user);
  });

  it('updates and returns user', async () => {
    const user = {
      id: 1,
      email: 'updated@email.com',
    } as User;

    mockUserService.update.mockResolvedValue(user);

    const result = await controller.update(1, { email: 'updated@email.com' });

    expect(mockUserService.update).toHaveBeenCalledWith(1, {
      email: 'updated@email.com',
    });
    expect(result).toEqual(user);
  });

  it('removes and returns user', async () => {
    const user = {
      email: 'deleted@email.com',
    } as User;

    mockUserService.remove.mockResolvedValue(user);

    const result = await controller.remove(1);

    expect(mockUserService.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual(user);
  });
});
