import { Response } from "express";

interface ApiResponse<T> {
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): void => {
  const response: ApiResponse<T> = {
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  error: any
): void => {
  if (error instanceof Error) {
    res.status(statusCode).json({
      error: error.message,
    });
  } else {
    res.status(statusCode).json({
      error: String(error),
    });
  }
};
