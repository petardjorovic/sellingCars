import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { Serialize } from '../decorators/serialize.decorator';
import { ReportDto } from './dtos/report.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  @Post()
  createReport(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: User,
  ) {
    return this.reportService.create(user, createReportDto);
  }
}
