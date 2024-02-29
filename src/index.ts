import {
  Engine,
  getAuthHeader,
  getUUIDHeader,
  Result,
  constructResult
} from './utils';

import InMemory from './caches/inmemory';

export class ZeroAccount {
  private readonly engine: Engine
  private appSecret: string

  constructor(appSecret: string, engine?: Engine) {
    this.appSecret = appSecret;
    this.engine = engine || new InMemory();
  }

  auth = async (headers: any, body: any): Promise<Result> => {
    if (!this.appSecret) {
      throw new Error("app secret is not set")
	}

    if (!this.engine) {
      throw new Error("engine is not set and/or the library is not initialised")
    }

    const uuid = getUUIDHeader(headers)
    if (!uuid) throw new Error("uuid is not provided")
	const authenticating = getAuthHeader(headers)?.toLowerCase() === "true"
    if (!authenticating) {
      const meta = body.metadata
      if (!meta.appSecret || meta.appSecret !== this.appSecret) {
        throw new Error("incorrect app secret")
      }
      delete body.metadata.appSecret
      await this.save(uuid, body)
      return constructResult(body, true)
    }

    const newBody = await this.authorize(uuid);
    return constructResult(newBody, false)
  }

  private async save(uuid: string, body: any) {
    if (!body) throw new Error('no data has been provided');
    if (!uuid) throw new Error('uuid is required');
    const err = await this.engine.set(uuid, JSON.stringify(body));
    if (err && err != 'OK') {
      throw new Error('engine error: ' + err.stack || err.message || err || 'unknown error');
    }
  }

  private async authorize(uuid: string): Promise<any> {
    const data = await this.engine.get(uuid);
    if (!data) throw new Error('could not get data from the engine');
    if (typeof data === 'string') {
      return JSON.parse(data);
    } else {
      return data;
    }
  }
}
