import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { Report } from './report.entity';
import { User } from '../user/user.entity';
import { NotFoundException } from '@nestjs/common';

type MockReportRepository = {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('ReportService', () => {
  let service: ReportService;
  let mockReportRepository: MockReportRepository;
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockReportRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: getRepositoryToken(Report),
          useValue: mockReportRepository,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a report', async () => {
    const user = {
      email: 'test@email.com',
      password: '123456',
      admin: false,
    } as User;

    const reportDto = {
      make: 'Ford',
      model: 'Mustang',
      year: 1969,
      mileage: 120000,
      lng: 45,
      lat: 45,
      price: 56000,
    };

    const report = {
      make: 'Ford',
      model: 'Mustang',
      year: 1969,
      mileage: 120000,
      lng: 45,
      lat: 45,
      price: 56000,
      approved: false,
    } as Report;

    mockReportRepository.create.mockReturnValue(report);
    mockReportRepository.save.mockResolvedValue({ ...report, user, id: 11 });

    const res = await service.create(user, reportDto);

    expect(mockReportRepository.create).toHaveBeenCalledWith(reportDto);
    expect(mockReportRepository.save).toHaveBeenCalledWith({ ...report, user });
    expect(res.user).toEqual(user);
    expect(res).toEqual({ ...report, id: 11, user });
  });

  it('should approve report', async () => {
    const report = {
      id: 1,
      make: 'Ford',
      model: 'Mustang',
      year: 1969,
      mileage: 120000,
      lng: 45,
      lat: 45,
      price: 56000,
      approved: false,
      user: {
        admin: false,
        email: 'test@email.com',
        password: 'secret',
      } as User,
    } as Report;

    mockReportRepository.findOne.mockResolvedValue(report);
    mockReportRepository.save.mockResolvedValue({ ...report, approved: true });

    const res = await service.changeApproval(1, true);

    expect(mockReportRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { user: true },
    });

    expect(report.approved).toBe(true);

    expect(mockReportRepository.save).toHaveBeenCalledWith(report);

    expect(res.approved).toBe(true);
  });

  it('should throw an error if report does not exist', async () => {
    mockReportRepository.findOne.mockResolvedValue(null);

    await expect(service.changeApproval(1, true)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockReportRepository.save).not.toHaveBeenCalled();
  });

  it('should estimate report price', async () => {
    mockQueryBuilder.getRawOne.mockResolvedValue({ price: 25000 });

    const dto = {
      make: 'Ford',
      model: 'Mustang',
      lng: 45,
      lat: 45,
      year: 1969,
      mileage: 100000,
    };

    const res = await service.estimateReport(dto);

    expect(mockReportRepository.createQueryBuilder).toHaveBeenCalled();

    expect(mockQueryBuilder.select).toHaveBeenCalledWith('AVG(price) AS price');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('make = :make', {
      make: dto.make,
    });
    expect(mockQueryBuilder.limit).toHaveBeenCalledWith(3);
    expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();

    expect(res).toEqual({ price: 25000 });
  });
});
