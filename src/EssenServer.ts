import EventEmitter from 'events'
import { Server, Socket } from 'net'
import EssenClient from './EssenClient'
import { EssenListenOptions } from './Types'

interface EssenServerEvents {
	connection: [EssenClient]
	error: [Error]
	listening: []
	close: []
}

interface EssenServer extends EventEmitter {

	on<K extends keyof EssenServerEvents>(event: K, listener: (...args: EssenServerEvents[K]) => void): this
	off<K extends keyof EssenServerEvents>(event: K, listener: (...args: EssenServerEvents[K]) => void): this
	once<K extends keyof EssenServerEvents>(event: K, listener: (...args: EssenServerEvents[K]) => void): this
	addListener<K extends keyof EssenServerEvents>(event: K, listener: (...args: EssenServerEvents[K]) => void): this
	prependListener<K extends keyof EssenServerEvents>(event: K, listener: (...args: EssenServerEvents[K]) => void): this
	removeListener<K extends keyof EssenServerEvents>(event: K, listener: (...args: EssenServerEvents[K]) => void): this
	removeAllListeners(event: keyof EssenServerEvents): this
	listeners<K extends keyof EssenServerEvents>(event: K): ((...args: EssenServerEvents[K]) => void)[]
	
	emit<K extends keyof EssenServerEvents>(event: K, ...args: EssenServerEvents[K]): boolean

}

class EssenServer extends EventEmitter {

	private server: Server

	constructor() {
		super()
		this.server = new Server()
	}

	public listen(options: EssenListenOptions): this {
		this.server.listen(options, () => {
			if (options.callback) options.callback(options)
		})

		this.server.on('close', () => this.emit('close'))
		this.server.on('error', (error: Error) => this.emit('error', error))
		this.server.on('listening', () => this.emit('listening'))
		this.server.on('connection', (socket: Socket) => this.emit('connection', new EssenClient(socket)))
		return this
	}

	public address() {
		return this.server.address()
	}

	public close(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.server.close((err?: Error) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}
}

export default EssenServer