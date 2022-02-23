import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

/**
 * Interface & Utility
 */

export type Topic = {
  topic: string
}

/**
 * Store constructor
 */

const NAME = 'chat'
const initialState: Topic = {
  topic: '',
}

/**
 * Actions
 */

export const setTopic = createAsyncThunk<Topic, { topic: string }>(
  `${NAME}/setTopic`,
  async ({ topic }) => {
    return { topic }
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
    void builder.addCase(
      setTopic.fulfilled,
      (state, { payload }) => void Object.assign(state, payload),
    ),
})

export default slice.reducer
