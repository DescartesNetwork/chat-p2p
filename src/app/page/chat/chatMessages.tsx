import { useWallet } from '@senhub/providers'
import { useSelector } from 'react-redux'
import moment from 'moment'

import { Card, Col, Row, Space, Typography } from 'antd'
import { AppState } from 'app/model'

const ChatMessages = () => {
  const { messages } = useSelector((state: AppState) => state.chat)
  const {
    wallet: { address: walletAddress },
  } = useWallet()
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
