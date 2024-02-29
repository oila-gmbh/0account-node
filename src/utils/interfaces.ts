export interface Engine {
  get(k: string): Promise<string>;
  set(k: string, v: string): Promise<any>;
}

export interface Result {
  data: any,
  metadata: {
    readonly userId: string,
    readonly profileId: string,
    readonly isWebhookRequest: boolean,
  }
}
