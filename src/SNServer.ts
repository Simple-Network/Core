import EventEmitter from 'events'
import { Server, Socket } from 'net'
import SNClient from './SNClient'
import { SNListenOptions } from './Types'

interface SNServerEvents {
	connection: [SNClient]
	error: [Error]
	opened: []
	close: []
}

interface SNServer extends EventEmitter {

	on<K extends keyof SNServerEvents>(event: K, listener: (...args: SNServerEvents[K]) => void): this
	off<K extends keyof SNServerEvents>(event: K, listener: (...args: SNServerEvents[K]) => void): this
	once<K extends keyof SNServerEvents>(event: K, listener: (...args: SNServerEvents[K]) => void): this
	addListener<K extends keyof SNServerEvents>(event: K, listener: (...args: SNServerEvents[K]) => void): this
	prependListener<K extends keyof SNServerEvents>(event: K, listener: (...args: SNServerEvents[K]) => void): this
	removeListener<K extends keyof SNServerEvents>(event: K, listener: (...args: SNServerEvents[K]) => void): this
	removeAllListeners(event: keyof SNServerEvents): this
	listeners<K extends keyof SNServerEvents>(event: K): ((...args: SNServerEvents[K]) => void)[]
	
	emit<K extends keyof SNServerEvents>(event: K, ...args: SNServerEvents[K]): boolean

}

class SNServer extends EventEmitter {

	private server: Server

	constructor() {
		super()
		this.server = new Server()
	}

	public listen(options: SNListenOptions): this {
		this.server.listen(options, () => {
			if (options.callback) options.callback(options)
		})

		this.server.on('close', () => this.emit('close'))
		this.server.on('error', (error: Error) => this.emit('error', error))
		this.server.on('listening', () => this.emit('opened'))
		this.server.on('connection', (socket: Socket) => this.emit('connection', new SNClient(socket)))
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

export default SNServer