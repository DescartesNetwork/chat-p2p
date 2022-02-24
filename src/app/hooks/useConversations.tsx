import { useWallet } from '@senhub/providers'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import {
  addRequestChat,
  Conversation,
  fetchConversation,
  RequestChat,
} from 'app/model/chat.controller'
import { db } from 'app/constants'

const UseConversations = (topic: string) => {
  const dispatch = useDispatch()
  const {
    wallet: { address: walletAddress },
  } = useWallet()

  const listenMyTopic = useCallback(async () => {
    if (topic !== walletAddress) return
    const messages = db.get(topic)
    const keys: string[] = []

    await messages.map().once(async (data, id) => {
      if (!data || !data.owner) return
      try {
        /**I accept request from people*/
        if (data.owner === walletAddress && data.sendTo) {
          const address = data.sendTo as string
          keys.push(address)
        }

        /**I have been accepted request */
        if (data.rely) {
          const address = data.owner as string
          keys.push(address)
        }
      } catch (er) {
        console.log(er)
      }
    })
    await messages.map().once(async (data, id) => {
      console.log(data)

      if (!data || !data.owner) return
      try {
        if (data.owner !== walletAddress && !keys.includes(data.owner)) {
          const messages = [data.chat]
          const requestChat: RequestChat = {
            owner: data.owner,
            publicKey: data.publicKey,
            messages,
            topic: data.commonTopic,
          }

          dispatch(addRequestChat({ requestChat }))
        }
        if (data.owner !== walletAddress && keys.includes(data.owner)) {
          const conversation: Conversation = {
            publicKey: data.publicKey,
            address: data.owner,
            topic: data.commonTopic,
          }
          dispatch(fetchConversation({ conversation }))
        }
      } catch (er) {
        console.log(er)
      }
    })
  }, [dispatch, topic, walletAddress])

  useEffect(() => {
    listenMyTopic()
  }, [listenMyTopic])
  return {}
}

export default UseConversations
