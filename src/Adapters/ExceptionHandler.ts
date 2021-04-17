import SNClient from 'src/SNClient'

export default abstract class ExceptionHandler {

	abstract handle(client: SNClient, current: any, error: any): void

}
