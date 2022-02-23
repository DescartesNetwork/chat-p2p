import { useWallet } from '@senhub/providers'
import { db } from 'app/constants'
import { addRequestChat, RequestChat } from 'app/model/chat.controller'
import { Conversations } from 'app/page/chat'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

const UseListConversation = (topic: string) => {
  const [listConversation, setListConversation] = useState<Conversations[]>([])
  const dispatch = useDispatch()
  const {
    wallet: { address: walletAddress },
  } = useWallet()

  const listenMyTopic = useCallback(async () => {
    if (topic !== walletAddress) return
    const messages = db.get(topic)
    const keys: string[] = []
    const keysReceived: Conversations[] = []

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
      if (!data || !data.owner) return
      try {
        if (data.owner !== walletAddress) {
          if (!keys.includes(data.owner)) {
            const requestChat: RequestChat = {
              owner: data.owner,
              publicKey: data.publicKey,
              message: data.chat,
            }
            dispatch(addRequestChat({ requestChat }))
          } else {
            keysReceived.push({
              publicKey: data.publicKey,
              address: data.owner,
            })
            setTimeout(() => {
              setListConversation(keysReceived)
            }, 1000)
          }
        }
      } catch (er) {
        console.log(er)
      }
    })
  }, [dispatch, topic, walletAddress])

  useEffect(() => {
    listenMyTopic()
  }, [listenMyTopic])
  return { listConversation }
}

export default UseListConversation
