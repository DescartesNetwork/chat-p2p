import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import util from 'tweetnacl-util'
import nacl from 'tweetnacl'

import storage from 'shared/storage'
import { decryptKey, encryptKey } from 'app/page/key'

/**
 * Interface & Utility
 */

export type KeyPair = {
  mySecretKey?: string
  myPublicKey?: string
}

export type KeyState = {
  keyPair: KeyPair
  keyPairDecrypted: KeyPair
}

/**
 * Store constructor
 */

const NAME = 'key'
const initialState: KeyState = {
  keyPair: {},
  keyPairDecrypted: {},
}

/**
 * Actions
 */

export const fetchKeyPair = createAsyncThunk<Partial<KeyState>>(
  `${NAME}/fetchKeyPair`,
  async () => {
    const keyPair: KeyPair = storage.get('keypair')
    return { keyPair }
  },
)

export const createKeyPair = createAsyncThunk<
  Partial<KeyState>,
  { password: string }
>(`${NAME}/createKeyPair`, async ({ password }) => {
  const wallet = window.sentre.wallet
  if (!wallet) throw new Error('Please connect wallet')

  const { signature } = await wallet.signMessage(
    `start Conversation with password: ${password}`,
  )
  if (!signature) return {}

  const secretKey = Buffer.from(signature.substring(0, 32))

  const keypair = nacl.box.keyPair.fromSecretKey(secretKey)
  const pk = util.encodeBase64(keypair.publicKey)
  const sk = util.encodeBase64(keypair.secretKey)

  const keyPair: KeyPair = {
    myPublicKey: encryptKey(password, pk),
    mySecretKey: encryptKey(password, sk),
  }
  storage.set('keypair', keyPair)
  return { keyPair }
})

export const decryptKeyPair = createAsyncThunk<
  Partial<KeyState>,
  { password: string },
  {
    state: any
  }
>(`${NAME}/decryptKeyPair`, async ({ password }, { getState }) => {
  const {
    key: { keyPair },
  } = getState()
  const parsePk = decryptKey(password, keyPair.myPublicKey)
  const parseSK = decryptKey(password, keyPair.mySecretKey)
  const keyPairDecrypted: KeyPair = {
    myPublicKey: parsePk,
    mySecretKey: parseSK,
  }
  return { keyPairDecrypted }
})

/**
 * Usual procedure
 */

const slice = createSlice({
  name: NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    void builder
      .addCase(
        fetchKeyPair.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        createKeyPair.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        decryptKeyPair.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      ),
})

export default slice.reducer
