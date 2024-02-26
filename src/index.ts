import {
  Engine,
  Options,
  getAuthHeader,
  getUUIDHeader,
  Result,
  constructResult
} from './utils';

import InMemory from './caches/inmemory';

export class ZeroAccount {
  private engine: Engine
  private options: Options

  constructor(options: Options = {}) {
    this.options = options;
    this.engine = options.engine || new InMemory();
  }

  auth = async (headers: any, body: any): Promise<Result> => {
    if (!this.options.appSecret) {
      throw new Error("app secret is not set")
	}

    if (!this.engine) {
      throw new Error("engine is not set and/or the library is not initialised")
    }

    const uuid = getAuthHeader(headers)
    if (!uuid) throw new Error("uuid is not provided")
	const authenticating = getUUIDHeader(headers) === "true"
    if (!authenticating) {
      const { data, metadata: meta } = body
      if (!meta.appSecret || meta.appSecret !== this.options.appSecret) {
        throw new Error("incorrect app secret")
      }
      delete data.metadata.appSecret
      await this.save(uuid, data)
      return constructResult(data, true)
    }

    const { data } = await this.authorize(uuid);
    return constructResult(data, false)
  }

  private async save(uuid: string, data: any) {
    if (!data) throw new Error('no data has been provided');
    if (!uuid) throw new Error('uuid is required');
    const { appSecret, ...rest } = data;
    const err = await this.engine.set(uuid, JSON.stringify(rest));
    if (err && err != 'OK') {
      throw new Error('engine error: ' + err.stack || err.message || err || 'unknown error');
    }
  }

  private async authorize(uuid: string): Promise<Result> {
    const data = await this.engine.get(uuid);
    if (!data) throw new Error('could not get data from the engine');
    if (typeof data === 'string') {
      return JSON.parse(data);
    } else {
      return data;
    }
  }
}
