// @ts-nocheck
import UsersRepository from './users.repository.js';
import ValidationError from '../../../core/utils/validation-error.js';

export default class UsersService {
  static async getAll(tenant_id) { return UsersRepository.getAll(tenant_id); }

  static async remove(user, tenant_id) {
    const result = await UsersRepository.getById(user, tenant_id);
    if (!result || result.length === 0) throw new ValidationError('Usuário não encontrado.', 404);
    if (result[0].admin === true) throw new ValidationError('Usuário administrador não pode ser removido.', 422);
    return UsersRepository.remove(user, tenant_id);
  }
}
