import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageGeneratorService } from './image-generator.service';
import axios from 'axios';
import type { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Image Generator')
@Controller('image')
export class ImageGeneratorController {
  constructor(private readonly imageService: ImageGeneratorService) {}

  @Post('generate')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Generate image from prompt and uploaded image',
    description:
      'Generate an image using AI based on a text prompt and an uploaded image. ' +
      'The response will stream the generated image directly and display it inline in the browser.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image', 'prompt'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Base image file to be processed by AI',
        },
        prompt: {
          type: 'string',
          example: 'Make this image look like a cinematic portrait',
          description: 'Text prompt to guide image generation',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Generated image streamed successfully',
    content: {
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found or failed to fetch image',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate or stream image',
  })
  async generate(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string,
    @Res() res: Response,
  ) {
    const result = await this.imageService.generateFromUpload(prompt, file);
    try {
      const imageResponse = (await axios.get<unknown>(result.imageUrl, {
        responseType: 'stream',
      })) as axios.AxiosResponse<NodeJS.ReadableStream>;

      if (
        !imageResponse ||
        imageResponse.status !== 200 ||
        !imageResponse.data
      ) {
        return res
          .status(404)
          .json({ message: 'Image not found or failed to fetch image' });
      }

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline',
      });

      imageResponse?.data?.pipe(res);
    } catch (error) {
      console.error('Error streaming image:', error);
      res.status(500).json({ message: 'Failed to stream image' });
    }
  }
}
