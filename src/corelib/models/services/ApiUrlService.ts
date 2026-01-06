export class ApiUrlService {
  private API_URL: string;
  private SOCKET_URL: string;
  private EXTERNAL_URL: string;

  public isUrlsSet() {
    return this.API_URL && this.SOCKET_URL;
  }

  public set externalUrl(v: string) {
    this.EXTERNAL_URL = v;
  }

  public get externalUrl() {
    return this.EXTERNAL_URL || import.meta.env.VITE_EXTERNAL_URL;
  }

  public set apiUrl(v: string) {
    this.API_URL = v;
  }

  public get apiUrl(): string {
    return this.API_URL || import.meta.env.VITE_API_URL;
  }

  public set socketUrl(v: string) {
    this.SOCKET_URL = v;
  }

  public get socketUrl(): string {
    return this.SOCKET_URL || import.meta.env.VITE_SOCKET_URL;
  }
}

export const APIUrls = new ApiUrlService();

export const APIEndpoints = {
  graphql: '/graphql',
  translations: '/translations',
};
