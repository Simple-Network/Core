import EventEmitter from 'events'
import { Socket } from 'net'
import { SNClientLocalInfos, SNClientRemoteInfos, SNTcpConnectOptions, SNIcpConnectOptions } from './Types'
import AdapterPipeline from './Adapters/AdapterPipeline'

interface SNClientEvents {
	close: [boolean]
	error: [Error]
	rawdata: [Buffer]
	timeout: []
	connected: [boolean]
}

interface SNClient extends EventEmitter {

	on<K extends keyof SNClientEvents>(event: K, listener: (...args: SNClientEvents[K]) => void): this
	off<K extends keyof SNClientEvents>(event: K, listener: (...args: SNClientEvents[K]) => void): this
	once<K extends keyof SNClientEvents>(event: K, listener: (...args: SNClientEvents[K]) => void): this
	addListener<K extends keyof SNClientEvents>(event: K, listener: (...args: SNClientEvents[K]) => void): this
	prependListener<K extends keyof SNClientEvents>(event: K, listener: (...args: SNClientEvents[K]) => void): this
	removeListener<K extends keyof SNClientEvents>(event: K, listener: (...args: SNClientEvents[K]) => void): this
	removeAllListeners(event: keyof SNClientEvents): this
	listeners<K extends keyof SNClientEvents>(event: K): ((...args: SNClientEvents[K]) => void)[]
	
	emit<K extends keyof SNClientEvents>(event: K, ...args: SNClientEvents[K]): boolean

}

class SNClient {

	private _connected: boolean
	private _adapterPipline: AdapterPipeline

	constructor(private socket: Socket = new Socket()) {
		this._connected = false
		this._adapterPipline = new AdapterPipeline()

		socket.on('close', (hadError: boolean) => this.close0(hadError))
		socket.on('error', (error: Error) => this.emit('error', error))
		socket.on('timeout', () => this.emit('timeout'))
		socket.on('data', (data: Buffer) => this.read0(data))
	}

	public connect(options: SNTcpConnectOptions): this
	public connect(options: SNIcpConnectOptions): this
	public connect(options: any) {
		this.socket.connect(options, () => {
			this._connected = true
			if (options.callback) options.callback(options)
		})
		return this
	}

	public async write(data: any) {
		let input = [ data ]
		let output: Array<any> = []

		for (const adapter of this._adapterPipline.adapters) {
			if (!adapter.isWritable()) continue
			for (const inputData of input) {
				await adapter.adapter.write(this, inputData, output)
			}
			input = output
			output = []
		}

		for (const outputData of input) {
			if (outputData instanceof Uint8Array)
				this.socket.write(outputData)
			else throw new Error('Final output must be a Uint8Array')
		}
	}

	public get remote(): SNClientRemoteInfos {
		return {
			address: this.socket.remoteAddress,
			port: this.socket.remotePort,
			family: this.socket.remoteFamily
		}
	}

	public get local(): SNClientLocalInfos {
		return {
			address: this.socket.localAddress,
			port: this.socket.localPort
		}
	}

	public get connected() {
		return this._connected
	}

	public close() {
		this.socket.end()
		this.socket.destroy()
		this.close0()
	}

	public get pipeline() {
		return this._adapterPipline
	}

	private async read0(data: Buffer) {
		this.emit('rawdata', data)
		let input = [ data ]
		let output: Array<any> = []

		for (const adapter of this._adapterPipline.adapters) {
			if (!adapter.isReadable()) continue
			for (const inputData of input) {
				try {
					await adapter.adapter.read(this, inputData, output)
				} catch (error) {
					this.error(inputData, error)
					return
				}
			}
			input = output
			output = []
		}
	}

	private error(current: any, error: any) {
		for (const adapter of this._adapterPipline.adapters) {
			if (!adapter.isExceptionHandler()) continue

			adapter.adapter.handle(this, current, error)
		}
	}

	private close0(hadError: boolean = false) {
		this.emit('close', hadError)
		this._connected = false
	}
}

export default SNClient