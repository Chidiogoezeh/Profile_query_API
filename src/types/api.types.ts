import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import type { ParsedQs } from "qs";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> extends PaginationParams {
  total: number;
  data: T[];
}

export interface ApiError extends Error {
  status: number;
}

export type ApiRequest<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> = Request<P, ResBody, ReqBody, ReqQuery>;

export type ApiResponse<ResBody = unknown> = Response<ResBody>;

export type ApiNextFunction = NextFunction;

export type ApiMiddleware = RequestHandler;
