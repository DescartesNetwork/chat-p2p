import { Button, Col, Input, Row, Typography } from 'antd'

import { EnterOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearMessages } from 'app/model/chat.controller'
import { setTopic } from 'app/model/topic.controller'
import { useWallet } from '@senhub/providers'

const FindUser = ({
  receiver,
  setUser,
}: {
  receiver: string
  setUser: (value: string) => void
}) => {
  const [value, setValue] = useState('')
  const dispatch = useDispatch()
  const {
    wallet: { address: walletAddress },
  } = useWallet()

  const stopChat = () => {
    dispatch(clearMessages())
    setUser('')
    dispatch(setTopic({ topic: walletAddress }))
  }

  const selectReceiver = () => {
    setUser(value)
    dispatch(setTopic({ topic: value }))
  }

  if (receiver)
    return (
      <Row gutter={[16, 16]}>
        <Col flex="auto">
          <Typography.Text>Receiver: {receiver}</Typography.Text>
        </Col>
        <Col>
          <Button type="primary" onClick={stopChat}>
            Clear receiver user
          </Button>
        </Col>
      </Row>
    )
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Typography.Title level={5}>Enter publickey receiver</Typography.Title>
      </Col>
      <Col flex="auto">
        <Input
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onPressEnter={selectReceiver}
        />
      </Col>
      <Col>
        <Button onClick={selectReceiver} icon={<EnterOutlined />} />
      </Col>
    </Row>
  )
}

export default FindUser
