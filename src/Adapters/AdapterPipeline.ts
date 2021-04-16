import NamedAdapter from "./NamedAdapter"
import ReadAdapter from "./ReadAdapters"
import WriteAdapter from "./WriteAdapter"

export default class AdapterPipeline {

	private _writeAdapters: Array<NamedAdapter<WriteAdapter<any, any>>> = []
	private _readAdapters: Array<NamedAdapter<ReadAdapter<any, any>>> = []

	public addLast<IN, OUT>(name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		const named = new NamedAdapter(name, adapter)

		if (named.isWritable()) this._writeAdapters.push(named)
		if (named.isReadable()) this._readAdapters.push(named)
	}

	public addFirst<IN, OUT>(name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		const named = new NamedAdapter(name, adapter)

		if (named.isWritable()) this._writeAdapters.splice(0, 0, named)
		if (named.isReadable()) this._readAdapters.splice(0, 0, named)
	}

	public addBefore<IN, OUT>(beforeName: string, name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		const named = new NamedAdapter(name, adapter)
		
		if (named.isWritable()) {
			const index = this.indexOf(this._writeAdapters, beforeName)
			this._writeAdapters.splice(index, 0, named)
		}
		if (named.isReadable()) {
			const index = this.indexOf(this._writeAdapters, beforeName)
			this._readAdapters.splice(index, 0, named)
		}
	}

	public addAfter<IN, OUT>(beforeName: string, name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		const named = new NamedAdapter(name, adapter)
		
		if (named.isWritable()) {
			const index = this.indexOf(this._writeAdapters, beforeName)
			this._writeAdapters.splice(index + 1, 0, named)
		}
		if (named.isReadable()) {
			const index = this.indexOf(this._writeAdapters, beforeName)
			this._readAdapters.splice(index + 1, 0, named)
		}
	}

	public removeAdapter(name: string): { reader?: ReadAdapter<any, any>, writer?: WriteAdapter<any, any> } {
		const writerIndex = this.indexOf(this._writeAdapters, name)
		const readerIndex = this.indexOf(this._readAdapters, name)
		const result: { reader?: ReadAdapter<any, any>, writer?: WriteAdapter<any, any> } = {}

		if (writerIndex > 0) result.writer = this._writeAdapters.splice(writerIndex, 1)[0].adapter
		if (readerIndex > 0) result.reader = this._readAdapters.splice(readerIndex, 1)[0].adapter
		return result
	}

	public writeAdapter(name: string) {
		return this._writeAdapters.find(named => named.name === name)?.adapter
	}

	public readAdapter(name: string) {
		return this._readAdapters.find(named => named.name === name)?.adapter
	}

	public get writeAdapters() {
		return this._writeAdapters
	}

	public get readAdapters() {
		return this._readAdapters
	}

	private indexOf(adapters: Array<NamedAdapter<any>>, name: string) {
		return adapters.findIndex(named => named.name === name)
	}
}