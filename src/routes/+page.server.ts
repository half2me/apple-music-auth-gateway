import { APPLE_PRIVATE_KEY, APPLE_TEAM_ID, APPLE_KEY_ID } from '$env/static/private'
import { SignJWT, importPKCS8 } from 'jose'

const alg = 'ES256'
const privKey = await importPKCS8(APPLE_PRIVATE_KEY, alg)

export async function load({ url }) {
  console.log()
  const token = await new SignJWT({
    origin: [url.origin],
  })
    .setProtectedHeader({ alg: 'ES256', kid: APPLE_KEY_ID })
    .setExpirationTime('1 day')
    .setIssuedAt()
    .setIssuer(APPLE_TEAM_ID)
    .sign(privKey)
  return { token }
}
