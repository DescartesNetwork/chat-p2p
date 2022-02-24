import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

/**
 * Interface & Utility
 */

export type Conversation = {
  address: string
  publicKey: string
  topic: string
  message?: Message
}

export type Message = {
  text: string
  createdAt: string
  owner: string
}
export type RequestChat = {
  owner: string
  publicKey: string
  messages: Message[]
  topic: string
}

export type Chats = {
  messages: Message[]
  requestChats: Record<string, RequestChat>
  conversations: Record<string, Conversation>
}

/**
 * Store constructor
 */

const NAME = 'chat'
const initialState: Chats = {
  messages: [],
  requestChats: {},
  conversations: {},
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
  const { owner, messages: newMess } = requestChat
  let newRequestChats = { ...requestChats }

  if (newRequestChats[owner]) {
    const { messages: oldMess } = newRequestChats[owner]
    const messages = oldMess.concat(newMess)
    newRequestChats[owner] = { ...newRequestChats[owner], messages }
    return { requestChats: newRequestChats }
  }
  newRequestChats[owner] = requestChat
  return { requestChats: newRequestChats }
})

export const clearRequest = createAsyncThunk(
  `${NAME}/clearRequest`,
  async ({ address }: { address: string }) => {
    return { address }
  },
)

export const fetchConversation = createAsyncThunk<
  Partial<Chats>,
  { conversation: Conversation },
  { state: any }
>(`${NAME}/fetchConversation`, async ({ conversation }, { getState }) => {
  const {
    chat: { conversations },
  } = getState()
  const { address } = conversation
  let newConversations = { ...conversations }
  if (!newConversations[address]) {
    newConversations[address] = conversation
    return { conversations: newConversations }
  }

  return { conversations: newConversations }
})

export const updateMessInOneConversation = createAsyncThunk<
  Partial<Chats>,
  { message: Message; address: string },
  { state: any }
>(
  `${NAME}/updateMessInOneConversation`,
  async ({ message, address }, { getState }) => {
    const {
      chat: { conversations },
    } = getState()
    const newConversation = { ...conversations }
    newConversation[address] = { ...newConversation[address], message }
    return { conversations: newConversation }
  },
)

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
        (state, { payload }) => void delete state.requestChats[payload.address],
      )
      .addCase(
        fetchConversation.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        updateMessInOneConversation.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      ),
})

export default slice.reducer
