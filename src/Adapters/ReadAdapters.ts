import EssenClient from "../EssenClient"

export default abstract class ReadAdapter<INPUT, OUTPUT> {

	public abstract read(socket: EssenClient, input: INPUT, out: Array<OUTPUT>): Promise<void>

}