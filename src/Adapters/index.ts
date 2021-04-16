import EssenClient from '../EssenClient'
import ReadAdapter from './ReadAdapters'
import WriteAdapter from './WriteAdapter'
import NamedAdapter from './NamedAdapter'
import AdapterPipeline from './AdapterPipeline'


abstract class ReadHandler<INPUT> extends ReadAdapter<INPUT, never> {

	public read(socket: EssenClient, input: INPUT): Promise<void> {
		return this.handle(socket, input)
	}

	public abstract handle(socket: EssenClient, input: INPUT): Promise<void>

}

export {
	ReadAdapter,
	WriteAdapter,
	ReadHandler,
	NamedAdapter,
	AdapterPipeline
}