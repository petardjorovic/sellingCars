import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { User } from '../user/user.entity';
import { Report } from './report.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Serialize } from '../decorators/serialize.decorator';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportDto } from './dtos/report.dto';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@UseGuards(AuthGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  getEstimate(@Query() query: GetEstimateDto) {
    return this.reportService.estimateReport(query);
  }

  @Serialize(ReportDto)
  @Post()
  createReport(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportService.create(user, createReportDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @Serialize(ReportDto)
  approveReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveReportDto: ApproveReportDto,
  ): Promise<Report> {
    return this.reportService.changeApproval(id, approveReportDto.approved);
  }
}
