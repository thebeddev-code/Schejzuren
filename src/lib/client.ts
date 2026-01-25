import { db } from './backend/db';
import { Options, } from './backend/router';
import { isTauri } from '@tauri-apps/api/core';
import { handleRequest } from './backend/router';

class ApiClient {
  private baseUrl = "http://localhost:5000/api/v1/";
  constructor() {
  }
  private async request<T>(
    method: string,
    route: string,
    options?: Options,
  ): Promise<T> {

    if (isTauri()) {
      return handleRequest(method, route, options) as T;
    }
    // TODO: implement web client logic
    // throw new Error("Not yet implemented!")
    return [] as T;
  }

  async get<T>(url: string, options?: Options) {
    return this.request<T>("GET", url, options);
  }

  async create<T>(
    url: string,
    options: Options
  ) {
    return this.request<T>("POST", url, options);
  }

  async update<T>(
    url: string,
    options: Options
  ) {
    return this.request<T>("PATCH", url, options);
  }

  async delete<T>(
    url: string,
  ) {
    return this.request<T>("DELETE", url);
  }
}

export const api = new ApiClient();
