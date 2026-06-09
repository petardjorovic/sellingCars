import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../user/user.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  create(user: User, data: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create(data);

    report.user = user;

    return this.reportRepository.save(report);
  }
}
