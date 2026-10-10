import crypto from 'crypto';


export function generateProductId(): string {
  const randomString = crypto.randomBytes(8).toString('hex');
  return `prod_${randomString}`;
}

export function generateCategoryId(): string {
  const randomString = crypto.randomBytes(8).toString('hex');
  return `cat_${randomString}`;
}