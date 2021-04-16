import SNClient from 'src/SNClient'

export default abstract class WriteAdapter<INPUT, OUTPUT> {

	public abstract write(socket: SNClient, input: INPUT, out: Array<OUTPUT>): Promise<void>

}