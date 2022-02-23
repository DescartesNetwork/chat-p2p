import { useCallback, useEffect, useState, useMemo } from 'react'
import nacl from 'tweetnacl'
import util from 'tweetnacl-util'
import { useDispatch, useSelector } from 'react-redux'

import { Col, Input, Row, Button, Card, Tabs } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import FindUser from './findUser'

import {
  decryptingMessage,
  encryptingMessage,
  MessageEncrypt,
} from 'app/page/key'
import 'antd/dist/antd.css'
import CopyPublicKey from './copyPub'
import { fetchNewMessages, Message } from 'app/model/chat.controller'
import { AppState } from 'app/model'
import { db, TOPIC } from 'app/constants'
import { useWallet } from '@senhub/providers'
import HeaderChat from './header'
import { decryptKeyPair, fetchKeyPair } from 'app/model/key.controller'
import ListConversation from './listConversation'
import ChatMessages from './chatMessages'
import UseListConversation from 'app/hooks/useListConversation'
import WaitingList from './waitingList'
import { setTopic } from 'app/model/topic.controller'

export type MessageData = MessageEncrypt & {
  owner: string
}

export type KeyEncrypt = {
  sk: string
  pk: string
}
export type Conversations = {
  address: string
  publicKey: string
}
const GunChat = () => {
  const {
    wallet: { address: walletAddress },
  } = useWallet()
  const [formChat, setFormChat] = useState('')
  const [receiver, setReceiver] = useState('')
  const [receiverPK, setReceiverPK] = useState<any>()
  const [chat, setChat] = useState(false)
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const {
    topic: { topic },
    key: {
      keyPairDecrypted: { myPublicKey, mySecretKey },
    },
  } = useSelector((state: AppState) => state)
  const { listConversation } = UseListConversation(topic)

  const sharedKey = useMemo(() => {
    if (!receiverPK || !mySecretKey) return
    try {
      const receiverDecode = util.decodeBase64(receiverPK)
      const secretKeyDecode = util.decodeBase64(mySecretKey)
      return nacl.box.before(receiverDecode, secretKeyDecode)
    } catch (err: any) {
      setReceiver('')
      window.notify({
        type: 'error',
        description: "Receiver's Public key wrong",
      })
    }
  }, [mySecretKey, receiverPK])

  // const commonTopic = useMemo(() => {
  //   if (!receiver) return ''
  //   return walletAddress.substring(0, 22) + receiver.substring(22, 44)
  // }, [receiver, walletAddress])

  const listenReceiverTopic = useCallback(async () => {
    if (topic !== receiver) return
    const messages = db.get(topic)
    messages.map().once(async (data, id) => {
      if (!data) return
      try {
        /** get history when send request && accepted */
        if (data.owner === receiver && data.sendTo === walletAddress) {
          console.log('check')
          setReceiverPK(data.publicKey)
          dispatch(setTopic({ topic: TOPIC }))
        }
        /** get history when accept a request */
        listConversation.forEach((item) => {
          if (item.address === data.sendTo) {
            setReceiverPK(item.publicKey)
            dispatch(setTopic({ topic: TOPIC }))
          }
        })
      } catch (er) {
        console.log(er)
      }
    })
  }, [dispatch, listConversation, receiver, topic, walletAddress])

  const listenCommonTopic = useCallback(async () => {
    if (!sharedKey) return
    const messages = db.get(topic)
    messages.map().once(async (data, id) => {
      if (!data || !sharedKey) return
      try {
        const text = decryptingMessage(data, sharedKey) || ''
        if (!text) return
        const createdAt = id
        const message: Message = {
          text,
          createdAt,
          owner: data.owner,
        }
        dispatch(fetchNewMessages({ message }))
      } catch (er) {
        console.log(er)
      }
    })
  }, [dispatch, sharedKey, topic])

  const startChat = useCallback(() => {
    dispatch(decryptKeyPair({ password }))
    return setChat(true)
  }, [dispatch, password])

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
    const message = db.get('messages').set({
      chat,
      publicKey: myPublicKey,
      owner: walletAddress,
      sendTo: receiver,
    })
    db.get(topic).get(id).put(message)

    return setFormChat('')
  }

  const stopChat = () => {
    setChat(false)
    setPassword('')
  }

  useEffect(() => {
    listenReceiverTopic()
  }, [listenReceiverTopic])

  useEffect(() => {
    listenCommonTopic()
  }, [listenCommonTopic])

  useEffect(() => {
    dispatch(fetchKeyPair())
    dispatch(setTopic({ topic: walletAddress }))
  }, [dispatch, walletAddress])
  console.log(topic)
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <HeaderChat
          chat={chat}
          setChat={setChat}
          stopChat={stopChat}
          startChat={startChat}
          setPassword={setPassword}
          password={password}
        />
      </Col>
      {chat && (
        <Col span={24}>
          <Card bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <CopyPublicKey pubKey={myPublicKey || ''} />
              </Col>
              <Col span={24}>
                <FindUser receiver={receiver} setUser={setReceiver} />
              </Col>
              <Col span={24}>
                <Tabs defaultActiveKey="chat-list">
                  <Tabs.TabPane tab="chat-list" key="chat-list">
                    <Card
                      style={{
                        height: 'calc(100vh - 350px)',
                        overflow: 'auto',
                        background: '#f1f9f9',
                        boxShadow: 'unset',
                      }}
                      bordered={false}
                    >
                      {receiver ? (
                        <ChatMessages />
                      ) : (
                        <ListConversation
                          listConversation={listConversation}
                          setReceiver={setReceiver}
                        />
                      )}
                    </Card>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="waiting-list" key="waiting-list">
                    <WaitingList
                      setReceiver={setReceiver}
                      setReceiverPK={setReceiverPK}
                    />
                  </Tabs.TabPane>
                </Tabs>
              </Col>
              {receiver && (
                <Col span={24}>
                  <Input
                    name="text"
                    value={formChat}
                    onChange={(e) => setFormChat(e.target.value)}
                    placeholder="Enter message"
                    size="large"
                    onPressEnter={
                      topic === receiver ? requestChat : sendMessage
                    }
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
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      )}
    </Row>
  )
}

export default GunChat
