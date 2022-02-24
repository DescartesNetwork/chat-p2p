import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useWallet } from '@senhub/providers'

import { Button, Input } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { encryptingMessage } from '../key'

import { db } from 'app/constants'
import { AppState } from 'app/model'
import { generateTopic } from 'app/helper'

const ActionChat = ({
  sharedKey,
  receiver,
}: {
  sharedKey?: Uint8Array
  receiver: string
}) => {
  const [formChat, setFormChat] = useState('')
  const {
    wallet: { address: walletAddress },
  } = useWallet()
  const {
    topic: { topic },
    key: {
      keyPairDecrypted: { myPublicKey },
    },
  } = useSelector((state: AppState) => state)

  const sendMessage = async () => {
    if (!sharedKey) return
    const messageEncrypted = encryptingMessage(formChat, sharedKey)
    const id = new Date().toISOString()
    const message = db
      .get('messages')
      .set({ ...messageEncrypted, owner: walletAddress })

    db.get(topic).get(id).put(message)

    return setFormChat('')
  }

  const requestChat = async () => {
    const id = new Date().toISOString()
    const chat = formChat
    const commonTopic = generateTopic(walletAddress, receiver)

    const message = db.get('messages').set({
      chat,
      publicKey: myPublicKey,
      owner: walletAddress,
      sendTo: receiver,
      commonTopic,
    })
    db.get(topic).get(id).put(message)

    return setFormChat('')
  }
  return (
    <Input
      name="text"
      value={formChat}
      onChange={(e) => setFormChat(e.target.value)}
      placeholder="Enter message"
      size="large"
      onPressEnter={topic === receiver ? requestChat : sendMessage}
      suffix={
        <Button
          type="text"
          size="small"
          onClick={topic === receiver ? requestChat : sendMessage}
          icon={<SendOutlined />}
        />
      }
      style={{ borderRadius: 8 }}
    />
  )
}

export default ActionChat
