import { Button, Col, Row, Space } from 'antd'
import { setTopic } from 'app/model/topic.controller'
import React from 'react'
import { useDispatch } from 'react-redux'
import { Conversations } from './index'

type Conversation = {
  listConversation: Conversations[]
  setReceiver: (value: string) => void
}

const ListConversation = ({ listConversation, setReceiver }: Conversation) => {
  const dispatch = useDispatch()

  const startToChat = (receiver: string) => {
    setReceiver(receiver)
    dispatch(setTopic({ topic: receiver }))
  }

  return (
    <Row gutter={[24, 24]}>
      {listConversation.map((key) => (
        <Col span={24} key={key.address}>
          <Space>
            {key.address}
            <Button onClick={() => startToChat(key.address)}>Start Chat</Button>
          </Space>
        </Col>
      ))}
    </Row>
  )
}

export default ListConversation
