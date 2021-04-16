import { IpcSocketConnectOpts, ListenOptions, TcpSocketConnectOpts } from 'net';

type Callback<T> = (options: T) => void

type EssenListenOptions = ListenOptions & { callback?: Callback<EssenListenOptions> }

type EssenTcpConnectOptions = TcpSocketConnectOpts & { callback?: Callback<EssenTcpConnectOptions> }
type EssenIcpConnectOptions = IpcSocketConnectOpts & { callback?: Callback<EssenIcpConnectOptions> }
type EssenClientRemoteInfos = { address?: string, port?: number, family?: string }
type EssenClientLocalInfos = { address?: string, port?: number }

export {
	Callback,
	EssenListenOptions,
	EssenTcpConnectOptions,
	EssenIcpConnectOptions,
	EssenClientRemoteInfos,
	EssenClientLocalInfos
}