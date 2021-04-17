import SNClient from '../SNClient'
import ReadAdapter from './ReadAdapters'
import WriteAdapter from './WriteAdapter'
import NamedAdapter from './NamedAdapter'
import AdapterPipeline from './AdapterPipeline'
import ExceptionHandler from './ExceptionHandler'

abstract class ReadHandler<INPUT> extends ReadAdapter<INPUT, never> {

	public read(socket: SNClient, input: INPUT): Promise<void> {
		return this.handle(socket, input)
	}

	public abstract handle(socket: SNClient, input: INPUT): Promise<void>

}

export {
	ReadAdapter,
	WriteAdapter,
	ReadHandler,
	NamedAdapter,
	ExceptionHandler,
	AdapterPipeline
}