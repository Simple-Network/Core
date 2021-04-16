import EssenClient from "../EssenClient"

export default abstract class WriteAdapter<INPUT, OUTPUT> {

	public abstract write(socket: EssenClient, input: INPUT, out: Array<OUTPUT>): Promise<void>

}