import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import nacl from 'tweetnacl'
import util from 'tweetnacl-util'

import { Button, Space, Typography } from 'antd'

import { db } from 'app/constants'
import { AppState } from 'app/model'
import {
  Conversation,
  Message,
  updateMessInOneConversation,
} from 'app/model/chat.controller'
import { decryptingMessage } from 'app/page/key'

const ConversationItem = ({
  conversation,
  startToChat,
}: {
  conversation: Conversation
  startToChat: (conversation: Conversation) => void
}) => {
  const { address, publicKey, topic, message } = conversation
  const {
    keyPairDecrypted: { mySecretKey },
  } = useSelector((state: AppState) => state.key)
  const dispatch = useDispatch()

  const sharedKey = useMemo(() => {
    if (!publicKey || !mySecretKey) return ''
    try {
      const receiverDecode = util.decodeBase64(publicKey)
      const secretKeyDecode = util.decodeBase64(mySecretKey)
      return nacl.box.before(receiverDecode, secretKeyDecode)
    } catch (err: any) {
      window.notify({
        type: 'error',
        description: "Receiver's Public key wrong",
      })
      return ''
    }
  }, [mySecretKey, publicKey])

  const getMessages = useCallback(() => {
    if (!sharedKey) return
    const messages = db.get(topic)
    messages.map().once(async (data, id) => {
      if (!data || !sharedKey) return
      try {
        const text = decryptingMessage(data, sharedKey)
        if (!text) return
        const createdAt = id
        const message: Message = {
          text,
          createdAt,
          owner: data.owner,
        }
        dispatch(updateMessInOneConversation({ message, address }))
      } catch (er) {
        console.log(er)
      }
    })
  }, [address, dispatch, sharedKey, topic])

  useEffect(() => {
    getMessages()
  }, [getMessages])

  return (
    <Space direction="vertical">
      <Space>
        {address}
        <Button onClick={() => startToChat(conversation)}>Start Chat</Button>
      </Space>
      <Space direction="vertical">
        <Typography.Text>Message: {message?.text}</Typography.Text>
        <Typography.Text type="secondary">
          Time: {message?.createdAt}
        </Typography.Text>
      </Space>
    </Space>
  )
}

export default ConversationItem
