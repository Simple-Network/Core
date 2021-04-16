import EventEmitter from 'events'
import { Socket } from 'net'
import { EssenClientLocalInfos, EssenClientRemoteInfos, EssenTcpConnectOptions, EssenIcpConnectOptions } from './Types'
import AdapterPipeline from './Adapters/AdapterPipeline'

interface EssenClientEvents {
	close: [boolean]
	error: [Error]
	rawdata: [Buffer]
	timeout: []
	connected: [boolean]
}

interface EssenClient extends EventEmitter {

	on<K extends keyof EssenClientEvents>(event: K, listener: (...args: EssenClientEvents[K]) => void): this
	off<K extends keyof EssenClientEvents>(event: K, listener: (...args: EssenClientEvents[K]) => void): this
	once<K extends keyof EssenClientEvents>(event: K, listener: (...args: EssenClientEvents[K]) => void): this
	addListener<K extends keyof EssenClientEvents>(event: K, listener: (...args: EssenClientEvents[K]) => void): this
	prependListener<K extends keyof EssenClientEvents>(event: K, listener: (...args: EssenClientEvents[K]) => void): this
	removeListener<K extends keyof EssenClientEvents>(event: K, listener: (...args: EssenClientEvents[K]) => void): this
	removeAllListeners(event: keyof EssenClientEvents): this
	listeners<K extends keyof EssenClientEvents>(event: K): ((...args: EssenClientEvents[K]) => void)[]
	
	emit<K extends keyof EssenClientEvents>(event: K, ...args: EssenClientEvents[K]): boolean

}

class EssenClient {

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

	public connect(options: EssenTcpConnectOptions): this
	public connect(options: EssenIcpConnectOptions): this
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

		for (const adapter of this._adapterPipline.writeAdapters) {
			await Promise.all(input.map((inputData: any) => adapter.adapter.write(this, inputData, output)))
			input = output
			output = []
		}

		for (const outputData of input) {
			if (outputData instanceof Uint8Array)
				this.socket.write(outputData)
			else throw new Error('Final output must be a Uint8Array')
		}
	}

	public get remote(): EssenClientRemoteInfos {
		return {
			address: this.socket.remoteAddress,
			port: this.socket.remotePort,
			family: this.socket.remoteFamily
		}
	}

	public get local(): EssenClientLocalInfos {
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

	private async read0(data: Buffer) {
		this.emit('rawdata', data)
		let input = [ data ]
		let output: Array<any> = []

		for (const adapter of this._adapterPipline.readAdapters) {
			await Promise.all(input.map((inputData: any) => adapter.adapter.read(this, inputData, output)))
			input = output
			output = []
		}
	}

	public get pipeline() {
		return this._adapterPipline
	}

	private close0(hadError: boolean = false) {
		this.emit('close', hadError)
		this._connected = false
	}
}

export default EssenClient