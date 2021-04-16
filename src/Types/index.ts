import { IpcSocketConnectOpts, ListenOptions, TcpSocketConnectOpts } from 'net'

type Callback<T> = (options: T) => void

type SNListenOptions = ListenOptions & { callback?: Callback<SNListenOptions> }

type SNTcpConnectOptions = TcpSocketConnectOpts & { callback?: Callback<SNTcpConnectOptions> }
type SNIcpConnectOptions = IpcSocketConnectOpts & { callback?: Callback<SNIcpConnectOptions> }
type SNClientRemoteInfos = { address?: string, port?: number, family?: string }
type SNClientLocalInfos = { address?: string, port?: number }

export {
	Callback,
	SNListenOptions,
	SNTcpConnectOptions,
	SNIcpConnectOptions,
	SNClientRemoteInfos,
	SNClientLocalInfos
}