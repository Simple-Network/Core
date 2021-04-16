import NamedAdapter from './NamedAdapter'
import ReadAdapter from './ReadAdapters'
import WriteAdapter from './WriteAdapter'

export default class AdapterPipeline {

	private _adapters: Array<NamedAdapter<WriteAdapter<any, any> | ReadAdapter<any, any>>> = []

	public addLast<IN, OUT>(name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		this._adapters.push(new NamedAdapter(name, adapter))
	}

	public addFirst<IN, OUT>(name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		this._adapters.splice(0, 0, new NamedAdapter(name, adapter))
	}

	public addBefore<IN, OUT>(beforeName: string, name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		const named = new NamedAdapter(name, adapter)
		const index = this.indexOf(beforeName)

		this._adapters.splice(index, 0, named)
	}

	public addAfter<IN, OUT>(beforeName: string, name: string, adapter: ReadAdapter<IN, OUT> | WriteAdapter<IN, OUT>) {
		const named = new NamedAdapter(name, adapter)
		const index = this.indexOf(beforeName)

		this._adapters.splice(index + 1, 0, named)
	}

	public removeAdapter(name: string): WriteAdapter<any, any> | ReadAdapter<any, any> {
		const index = this.indexOf(name)

		return this._adapters.splice(index, 1)[0]?.adapter
	}

	public adapter<T extends WriteAdapter<any, any> | ReadAdapter<any, any>>(name: string): T | undefined {
		const named = this._adapters.find(named => named.name === name)

		return <T> named?.adapter
	}

	public get adapters() {
		return this._adapters
	}

	private indexOf(name: string) {
		return this._adapters.findIndex(named => named.name === name)
	}
}