import ValidationError from '../../utils/validation-error.js';
import type UserModel from './users.model.js';
import UsersRepository from './users.repository.js';

export default class UsersService {
  static async getAll(tenantId: number) {
    return UsersRepository.getAll(tenantId);
  }

  static async remove(user: UserModel, tenantId: number) {
    const result = await UsersRepository.getById(user, tenantId);

    if (!result || result.length === 0) {
      throw new ValidationError('Usuário não encontrado.', 404);
    }

    if (result[0].admin === true) {
      throw new ValidationError('Usuário administrador não pode ser removido.', 422);
    }

    return UsersRepository.remove(user, tenantId);
  }
}
