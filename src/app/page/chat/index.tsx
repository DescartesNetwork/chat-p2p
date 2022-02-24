import { useCallback, useEffect, useState, useMemo } from 'react'
import nacl from 'tweetnacl'
import util from 'tweetnacl-util'
import { useDispatch, useSelector } from 'react-redux'
import { useWallet } from '@senhub/providers'

import { Col, Row, Card, Tabs } from 'antd'
import WaitingList from './waitingList'
import ChatMessages from './chatMessages'
import CopyPublicKey from './copyPub'
import HeaderChat from './header'
import ListConversation from './conversations'
import ActionChat from './actionChat'
import FindUser from './findUser'

import { AppState } from 'app/model'
import { db } from 'app/constants'
import { decryptKeyPair, fetchKeyPair } from 'app/model/key.controller'
import { setTopic } from 'app/model/topic.controller'

import 'antd/dist/antd.css'

const GunChat = () => {
  const {
    wallet: { address: walletAddress },
  } = useWallet()
  const [receiver, setReceiver] = useState('')
  const [receiverPK, setReceiverPK] = useState('')
  const [chat, setChat] = useState(false)
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const {
    topic: { topic },
    key: {
      keyPairDecrypted: { myPublicKey, mySecretKey },
    },
    chat: { conversations },
  } = useSelector((state: AppState) => state)
  console.log('conversations: ', conversations)

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

  const listenReceiverTopic = useCallback(async () => {
    if (topic !== receiver) return
    const messages = db.get(topic)
    messages.map().once(async (data, id) => {
      if (!data) return
      try {
        Object.values(conversations).forEach((item) => {
          if (item.address === data.sendTo) {
            setReceiverPK(item.publicKey)
            dispatch(setTopic({ topic: data.commonTopic }))
          }
        })
      } catch (er) {
        console.log(er)
      }
    })
  }, [conversations, dispatch, receiver, topic])

  const startChat = useCallback(() => {
    dispatch(decryptKeyPair({ password }))
    return setChat(true)
  }, [dispatch, password])

  const stopChat = () => {
    setChat(false)
    setPassword('')
  }

  useEffect(() => {
    listenReceiverTopic()
  }, [listenReceiverTopic])

  useEffect(() => {
    dispatch(fetchKeyPair())
    dispatch(setTopic({ topic: walletAddress }))
  }, [dispatch, walletAddress])

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
                        <ChatMessages sharedKey={sharedKey} />
                      ) : (
                        <ListConversation
                          setReceiver={setReceiver}
                          setReceiverPK={setReceiverPK}
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
                <ActionChat sharedKey={sharedKey} receiver={receiver} />
              )}
            </Row>
          </Card>
        </Col>
      )}
    </Row>
  )
}

export default GunChat
