import ExceptionHandler from './ExceptionHandler'
import ReadAdapter from './ReadAdapters'
import WriteAdapter from './WriteAdapter'

export default class NamedAdapter<ADAPTER extends WriteAdapter<any, any> | ReadAdapter<any, any> | ExceptionHandler> {

	constructor(readonly name: string, readonly adapter: ADAPTER) {}

	public isWritable(): this is NamedAdapter<WriteAdapter<any, any>> {
		return this.adapter instanceof WriteAdapter
	}

	public isReadable(): this is NamedAdapter<ReadAdapter<any, any>> {
		return this.adapter instanceof ReadAdapter
	}

	public isExceptionHandler(): this is NamedAdapter<ExceptionHandler> {
		return this.adapter instanceof ExceptionHandler
	}
}