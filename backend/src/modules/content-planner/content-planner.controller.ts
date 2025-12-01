import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ContentPlannerService } from './content-planner.service';
import { CreateContentPlannerDto } from './dto/request/create-content-planner.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { GenerateContentPlannerResponseDto } from './dto/response/generate-content-planner-response.dto';
import { ContentPlannerResultResponseDto } from './dto/response/content-planner-result-response.dto';
import { EnhancePromptResponseDto } from './dto/response/enhanced-prompt-response.dto';
import { EnhancePromptDto } from './dto/request/enhanced-prompt.dto';

@ApiTags('Content Planner')
@Controller('content-planner')
export class ContentPlannerController {
  constructor(private readonly contentPlanService: ContentPlannerService) {}

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60, limit: 15 } })
  @Post('generate')
  @ApiOperation({
    summary: 'Start AI content planner generation',
    description:
      'Start an asynchronous AI job to generate content planner ideas. ' +
      'This endpoint returns a jobId that can be used to fetch the result later.',
  })
  @ApiResponse({
    status: 202,
    description: 'AI generation job accepted',
    type: GenerateContentPlannerResponseDto,
  })
  generate(@Body() dto: CreateContentPlannerDto) {
    return this.contentPlanService.generate(dto);
  }

  @UseGuards(ApiKeyGuard)
  @ApiSecurity('apiKey') // <— penting buat Swagger
  @Post('enhance-prompt')
  @ApiOperation({
    summary: 'Enhance AI prompt',
    description:
      'Enhance a raw caption into a more structured and effective AI prompt. ' +
      'This endpoint returns the enhanced prompt immediately.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prompt successfully enhanced',
    type: EnhancePromptResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  async enhancePrompt(
    @Body() dto: EnhancePromptDto,
  ): Promise<EnhancePromptResponseDto> {
    return this.contentPlanService.enhancedPrompt(dto.caption);
  }

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60, limit: 20 } })
  @Get('result/:jobId')
  @ApiOperation({
    summary: 'Get AI content planner generation result',
    description:
      'Retrieve the result of an AI content planner generation job using jobId. ' +
      'If the job is still processing, the response will indicate the current status.',
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID of the completed content planner generation',
  })
  @ApiResponse({
    status: 200,
    description: 'AI content planner generation completed',
    type: ContentPlannerResultResponseDto,
  })
  @ApiResponse({
    status: 202,
    description: 'AI generation is still in progress',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  getResult(@Param('jobId') jobId: string) {
    return this.contentPlanService.getResult(jobId);
  }

  @Get(':jobId/export-pdf')
  @ApiOperation({
    summary: 'Export content calendar as PDF',
    description:
      'Export the generated content calendar into a downloadable PDF file. ' +
      'The response will be a PDF file attachment, not a JSON payload.',
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID of the completed content planner generation',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF file generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found or not completed yet',
  })
  @ApiProduces('application/pdf')
  async exportCalendarPdf(@Param('jobId') jobId: string, @Res() res: Response) {
    // ⬇️ Delegate ke service (GOOD PRACTICE)
    const pdfBytes = await this.contentPlanService.exportPdf(jobId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="content-calendar.pdf"',
    );

    res.end(Buffer.from(pdfBytes));
  }
}
