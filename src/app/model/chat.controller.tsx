import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

/**
 * Interface & Utility
 */

export type Message = {
  text: string
  createdAt: string
  owner: string
}
export type RequestChat = {
  owner: string
  publicKey: string
  message: string
}

export type Chats = { messages: Message[]; requestChats: RequestChat[] }

/**
 * Store constructor
 */

const NAME = 'chat'
const initialState: Chats = {
  messages: [],
  requestChats: [],
}

/**
 * Actions
 */

export const fetchNewMessages = createAsyncThunk<
  Partial<Chats>,
  { message: Message },
  { state: any }
>(`${NAME}/fetchNewMessages`, async ({ message }, { getState }) => {
  const {
    chat: { messages },
  } = getState()
  const newMessages: Message[] = [...messages]
  newMessages.push(message)
  return { messages: newMessages }
})

export const clearMessages = createAsyncThunk<Partial<Chats>>(
  `${NAME}/clearMessages`,
  async () => {
    return { messages: [] }
  },
)

export const addRequestChat = createAsyncThunk<
  Partial<Chats>,
  { requestChat: RequestChat },
  { state: any }
>(`${NAME}/addRequestChat`, async ({ requestChat }, { getState }) => {
  const {
    chat: { requestChats },
  } = getState()
  const newRequestChats: RequestChat[] = [...requestChats]
  newRequestChats.push(requestChat)
  return { requestChats: newRequestChats }
})

export const clearRequest = createAsyncThunk<
  Partial<Chats>,
  { requestChat: RequestChat },
  { state: any }
>(`${NAME}/clearRequest`, async ({ requestChat }, { getState }) => {
  const {
    chat: { requestChats },
  } = getState()
  const newRequestChats: RequestChat[] = [...requestChats]

  const index = newRequestChats.indexOf(requestChat)
  if (index > -1) {
    newRequestChats.splice(index, 1) // 2nd parameter means remove one item only
  }
  return { requestChats: newRequestChats }
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
        fetchNewMessages.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        clearMessages.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        addRequestChat.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        clearRequest.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      ),
})

export default slice.reducer
