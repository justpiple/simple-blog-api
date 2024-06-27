import * as bcrypt from 'bcrypt';

export async function encryptData(data: string) {
  const saltOrRounds = 11;

  return await bcrypt.hash(data, saltOrRounds);
}

export async function compareData(plainData: string, encryptedData: string) {
  return await bcrypt.compare(plainData, encryptedData);
}
