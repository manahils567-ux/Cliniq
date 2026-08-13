import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NewsletterService } from './newsletter.service';

const subscribe = catchAsync(async (req: Request, res: Response) => {
    const result = await NewsletterService.subscribe(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: result.message,
        success: true,
        data: result,
    });
});

export const NewsletterController = {
    subscribe,
};
