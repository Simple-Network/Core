import SNClient from 'src/SNClient'

export default abstract class ReadAdapter<INPUT, OUTPUT> {

	public abstract read(socket: SNClient, input: INPUT, out: Array<OUTPUT>): Promise<void>

}