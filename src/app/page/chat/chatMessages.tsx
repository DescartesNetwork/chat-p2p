import { useWallet } from '@senhub/providers'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import { Card, Col, Row, Space, Typography } from 'antd'
import { AppState } from 'app/model'
import { db } from 'app/constants'
import { useCallback, useEffect } from 'react'
import { decryptingMessage } from '../key'
import { fetchNewMessages, Message } from 'app/model/chat.controller'

const ChatMessages = ({ sharedKey }: { sharedKey?: Uint8Array }) => {
  const {
    topic: { topic },
    chat: { messages },
  } = useSelector((state: AppState) => state)
  const {
    wallet: { address: walletAddress },
  } = useWallet()
  const dispatch = useDispatch()

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

  useEffect(() => {
    listenCommonTopic()
  }, [listenCommonTopic])

  return (
    <Row gutter={[16, 16]}>
      {messages.map((mess, index) => {
        return (
          <Col span={24} key={index}>
            <Row
              gutter={[16, 16]}
              justify={walletAddress === mess.owner ? 'end' : 'start'}
            >
              <Col span={14}>
                <Card
                  bordered={false}
                  style={{
                    boxShadow: '0 0 15px #dadada',
                    borderRadius: 12,
                    backgroundColor:
                      walletAddress === mess.owner ? '#69CCFA' : '#ffff',
                  }}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  <Space direction="vertical" size={0}>
                    <Space>
                      {/* {avatar(mess.owner)} */}
                      <Typography.Text>{mess.text}</Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      <Space>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          Time:
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {moment(mess.createdAt).format('YYYY-MM-DD HH:MM:ss')}
                        </Typography.Text>
                      </Space>
                    </Typography.Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>
        )
      })}
    </Row>
  )
}

export default ChatMessages
