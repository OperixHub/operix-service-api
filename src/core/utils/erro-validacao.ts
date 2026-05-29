export default class ErroValidacao extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ErroValidacao';
    this.status = status;
  }
}
